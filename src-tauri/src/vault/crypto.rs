//! Password-based key derivation (Argon2id) and authenticated encryption
//! (AES-256-GCM) for vault payloads.
//!
//! No function in this module ever returns key material or plaintext
//! password bytes to a caller outside Rust — see `src/commands`.

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Key, Nonce,
};
use argon2::{Algorithm, Argon2, Params, Version};
use rand::RngExt;
use zeroize::Zeroizing;

pub const SALT_LEN: usize = 32;
pub const NONCE_LEN: usize = 12;
pub const KEY_LEN: usize = 32;

/// Argon2id parameters. Stored in the vault header so a vault created with
/// one set of parameters can still be opened if the defaults change later.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct KdfParams {
    pub m_cost: u32,
    pub t_cost: u32,
    pub p_cost: u32,
}

impl Default for KdfParams {
    /// OWASP-recommended Argon2id baseline (19 MiB, 2 iterations, 1 lane).
    fn default() -> Self {
        Self {
            m_cost: 19_456,
            t_cost: 2,
            p_cost: 1,
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum CryptoError {
    #[error("invalid key derivation parameters")]
    InvalidParams,
    #[error("key derivation failed")]
    KeyDerivation,
    #[error("vault is corrupted or password is incorrect")]
    DecryptionFailed,
    #[error("encryption failed")]
    EncryptionFailed,
}

/// Derive a 256-bit key from a password and salt using Argon2id.
///
/// The returned key is wrapped in `Zeroizing` so it is wiped from memory
/// as soon as it is dropped.
pub fn derive_key(
    password: &[u8],
    salt: &[u8; SALT_LEN],
    params: &KdfParams,
) -> Result<Zeroizing<[u8; KEY_LEN]>, CryptoError> {
    let argon2_params = Params::new(
        params.m_cost,
        params.t_cost,
        params.p_cost,
        Some(KEY_LEN),
    )
    .map_err(|_| CryptoError::InvalidParams)?;

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, argon2_params);

    let mut key = Zeroizing::new([0u8; KEY_LEN]);
    argon2
        .hash_password_into(password, salt, key.as_mut())
        .map_err(|_| CryptoError::KeyDerivation)?;

    Ok(key)
}

/// Generate a fresh random salt for key derivation.
pub fn generate_salt() -> [u8; SALT_LEN] {
    let mut salt = [0u8; SALT_LEN];
    rand::rng().fill(&mut salt);
    salt
}

/// Generate a fresh random nonce for AES-256-GCM.
///
/// A nonce must never be reused with the same key. Every encryption call
/// in this codebase generates a new one.
pub fn generate_nonce() -> [u8; NONCE_LEN] {
    let mut nonce = [0u8; NONCE_LEN];
    rand::rng().fill(&mut nonce);
    nonce
}

/// Encrypt `plaintext` with AES-256-GCM. The returned buffer is the
/// ciphertext with the 16-byte authentication tag appended.
pub fn encrypt(
    key: &[u8; KEY_LEN],
    nonce: &[u8; NONCE_LEN],
    plaintext: &[u8],
) -> Result<Vec<u8>, CryptoError> {
    let cipher = Aes256Gcm::new(&Key::<Aes256Gcm>::from(*key));
    let nonce = Nonce::from(*nonce);
    cipher
        .encrypt(&nonce, plaintext)
        .map_err(|_| CryptoError::EncryptionFailed)
}

/// Decrypt `ciphertext` (ciphertext with authentication tag appended) with
/// AES-256-GCM.
///
/// Returns a single generic error on any failure — wrong key and tampered
/// ciphertext are indistinguishable to the caller by design, so this must
/// never leak which one occurred.
pub fn decrypt(
    key: &[u8; KEY_LEN],
    nonce: &[u8; NONCE_LEN],
    ciphertext: &[u8],
) -> Result<Zeroizing<Vec<u8>>, CryptoError> {
    let cipher = Aes256Gcm::new(&Key::<Aes256Gcm>::from(*key));
    let nonce = Nonce::from(*nonce);
    cipher
        .decrypt(&nonce, ciphertext)
        .map(Zeroizing::new)
        .map_err(|_| CryptoError::DecryptionFailed)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip_encrypt_decrypt() {
        let salt = generate_salt();
        let params = KdfParams::default();
        let key = derive_key(b"correct horse battery staple", &salt, &params).unwrap();

        let nonce = generate_nonce();
        let plaintext = b"the quick brown fox jumps over the lazy dog";

        let ciphertext = encrypt(&key, &nonce, plaintext).unwrap();
        assert_ne!(ciphertext[..plaintext.len()], plaintext[..]);

        let decrypted = decrypt(&key, &nonce, &ciphertext).unwrap();
        assert_eq!(&decrypted[..], plaintext);
    }

    #[test]
    fn round_trip_empty_plaintext() {
        let salt = generate_salt();
        let params = KdfParams::default();
        let key = derive_key(b"password", &salt, &params).unwrap();
        let nonce = generate_nonce();

        let ciphertext = encrypt(&key, &nonce, b"").unwrap();
        let decrypted = decrypt(&key, &nonce, &ciphertext).unwrap();
        assert_eq!(&decrypted[..], b"");
    }

    #[test]
    fn wrong_password_fails_to_decrypt() {
        let salt = generate_salt();
        let params = KdfParams::default();
        let nonce = generate_nonce();
        let plaintext = b"super secret notes";

        let right_key = derive_key(b"correct-password", &salt, &params).unwrap();
        let ciphertext = encrypt(&right_key, &nonce, plaintext).unwrap();

        let wrong_key = derive_key(b"wrong-password", &salt, &params).unwrap();
        let result = decrypt(&wrong_key, &nonce, &ciphertext);

        assert!(matches!(result, Err(CryptoError::DecryptionFailed)));
    }

    #[test]
    fn corrupted_ciphertext_fails_to_decrypt() {
        let salt = generate_salt();
        let params = KdfParams::default();
        let key = derive_key(b"password", &salt, &params).unwrap();
        let nonce = generate_nonce();

        let mut ciphertext = encrypt(&key, &nonce, b"notes payload").unwrap();
        // Flip a byte in the middle of the ciphertext.
        let mid = ciphertext.len() / 2;
        ciphertext[mid] ^= 0xFF;

        let result = decrypt(&key, &nonce, &ciphertext);
        assert!(matches!(result, Err(CryptoError::DecryptionFailed)));
    }

    #[test]
    fn corrupted_tag_fails_to_decrypt() {
        let salt = generate_salt();
        let params = KdfParams::default();
        let key = derive_key(b"password", &salt, &params).unwrap();
        let nonce = generate_nonce();

        let mut ciphertext = encrypt(&key, &nonce, b"notes payload").unwrap();
        let last = ciphertext.len() - 1;
        ciphertext[last] ^= 0xFF;

        let result = decrypt(&key, &nonce, &ciphertext);
        assert!(matches!(result, Err(CryptoError::DecryptionFailed)));
    }

    #[test]
    fn same_password_different_salt_yields_different_keys() {
        let params = KdfParams::default();
        let salt_a = generate_salt();
        let salt_b = generate_salt();

        let key_a = derive_key(b"identical-password", &salt_a, &params).unwrap();
        let key_b = derive_key(b"identical-password", &salt_b, &params).unwrap();

        assert_ne!(&key_a[..], &key_b[..]);
    }

    #[test]
    fn nonce_reuse_with_different_plaintext_yields_different_ciphertext() {
        let salt = generate_salt();
        let params = KdfParams::default();
        let key = derive_key(b"password", &salt, &params).unwrap();
        let nonce = generate_nonce();

        let ct1 = encrypt(&key, &nonce, b"message one").unwrap();
        let ct2 = encrypt(&key, &nonce, b"message two").unwrap();
        assert_ne!(ct1, ct2);
    }
}
