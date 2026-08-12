//! `.nermal` file layout: a fixed-size, non-secret header followed by the
//! AES-256-GCM-encrypted payload (with its authentication tag appended).
//!
//! ```text
//! MAGIC(7) VERSION(1) KDF_ID(1) M_COST(4) T_COST(4) P_COST(4)
//! CIPHER_ID(1) SALT(32) NONCE(12) || ENCRYPTED PAYLOAD (with GCM tag)
//! ```
//!
//! The header is never secret — only the payload is. `MAGIC` identifies the
//! file as a nermal vault; `version` is independent of it so the on-disk
//! format can evolve without changing the magic bytes.

use crate::vault::crypto::{KdfParams, NONCE_LEN, SALT_LEN};

pub const MAGIC: &[u8; 7] = b"NERMALV";
pub const CURRENT_VERSION: u8 = 2;

const KDF_ID_ARGON2ID: u8 = 1;
const CIPHER_ID_AES_256_GCM: u8 = 1;

pub const HEADER_LEN: usize = MAGIC.len() // magic
    + 1 // version
    + 1 // kdf id
    + 4 + 4 + 4 // m_cost, t_cost, p_cost
    + 1 // cipher id
    + SALT_LEN
    + NONCE_LEN;

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum FormatError {
    #[error("file is too short to contain a valid vault header")]
    TooShort,
    #[error("not a nermal vault file (bad magic bytes)")]
    BadMagic,
    #[error("unsupported vault format version: {0}")]
    UnsupportedVersion(u8),
    #[error("unsupported key derivation function id: {0}")]
    UnsupportedKdf(u8),
    #[error("unsupported cipher id: {0}")]
    UnsupportedCipher(u8),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VaultHeader {
    pub version: u8,
    pub kdf_params: KdfParams,
    pub salt: [u8; SALT_LEN],
    pub nonce: [u8; NONCE_LEN],
}

impl VaultHeader {
    pub fn new(kdf_params: KdfParams, salt: [u8; SALT_LEN], nonce: [u8; NONCE_LEN]) -> Self {
        Self {
            version: CURRENT_VERSION,
            kdf_params,
            salt,
            nonce,
        }
    }

    /// Serialize the header to its fixed-size on-disk representation.
    pub fn to_bytes(&self) -> [u8; HEADER_LEN] {
        let mut out = [0u8; HEADER_LEN];
        let mut pos = 0;

        out[pos..pos + MAGIC.len()].copy_from_slice(MAGIC);
        pos += MAGIC.len();

        out[pos] = self.version;
        pos += 1;

        out[pos] = KDF_ID_ARGON2ID;
        pos += 1;

        out[pos..pos + 4].copy_from_slice(&self.kdf_params.m_cost.to_le_bytes());
        pos += 4;
        out[pos..pos + 4].copy_from_slice(&self.kdf_params.t_cost.to_le_bytes());
        pos += 4;
        out[pos..pos + 4].copy_from_slice(&self.kdf_params.p_cost.to_le_bytes());
        pos += 4;

        out[pos] = CIPHER_ID_AES_256_GCM;
        pos += 1;

        out[pos..pos + SALT_LEN].copy_from_slice(&self.salt);
        pos += SALT_LEN;

        out[pos..pos + NONCE_LEN].copy_from_slice(&self.nonce);
        pos += NONCE_LEN;

        debug_assert_eq!(pos, HEADER_LEN);
        out
    }

    /// Parse a header from the start of `bytes`. Returns the header plus
    /// the number of bytes consumed, so the caller knows where the
    /// encrypted payload begins.
    pub fn from_bytes(bytes: &[u8]) -> Result<(Self, usize), FormatError> {
        if bytes.len() < HEADER_LEN {
            return Err(FormatError::TooShort);
        }

        let mut pos = 0;

        if &bytes[pos..pos + MAGIC.len()] != MAGIC {
            return Err(FormatError::BadMagic);
        }
        pos += MAGIC.len();

        let version = bytes[pos];
        pos += 1;
        if version != CURRENT_VERSION {
            return Err(FormatError::UnsupportedVersion(version));
        }

        let kdf_id = bytes[pos];
        pos += 1;
        if kdf_id != KDF_ID_ARGON2ID {
            return Err(FormatError::UnsupportedKdf(kdf_id));
        }

        let m_cost = u32::from_le_bytes(bytes[pos..pos + 4].try_into().unwrap());
        pos += 4;
        let t_cost = u32::from_le_bytes(bytes[pos..pos + 4].try_into().unwrap());
        pos += 4;
        let p_cost = u32::from_le_bytes(bytes[pos..pos + 4].try_into().unwrap());
        pos += 4;

        let cipher_id = bytes[pos];
        pos += 1;
        if cipher_id != CIPHER_ID_AES_256_GCM {
            return Err(FormatError::UnsupportedCipher(cipher_id));
        }

        let mut salt = [0u8; SALT_LEN];
        salt.copy_from_slice(&bytes[pos..pos + SALT_LEN]);
        pos += SALT_LEN;

        let mut nonce = [0u8; NONCE_LEN];
        nonce.copy_from_slice(&bytes[pos..pos + NONCE_LEN]);
        pos += NONCE_LEN;

        debug_assert_eq!(pos, HEADER_LEN);

        Ok((
            Self {
                version,
                kdf_params: KdfParams {
                    m_cost,
                    t_cost,
                    p_cost,
                },
                salt,
                nonce,
            },
            pos,
        ))
    }
}

/// Concatenate a header and an encrypted payload into the full on-disk
/// vault file layout.
pub fn encode_vault(header: &VaultHeader, encrypted_payload: &[u8]) -> Vec<u8> {
    let mut out = Vec::with_capacity(HEADER_LEN + encrypted_payload.len());
    out.extend_from_slice(&header.to_bytes());
    out.extend_from_slice(encrypted_payload);
    out
}

/// Split a full vault file into its header and encrypted payload.
pub fn decode_vault(bytes: &[u8]) -> Result<(VaultHeader, &[u8]), FormatError> {
    let (header, consumed) = VaultHeader::from_bytes(bytes)?;
    Ok((header, &bytes[consumed..]))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_header() -> VaultHeader {
        VaultHeader::new(
            KdfParams::default(),
            [7u8; SALT_LEN],
            [9u8; NONCE_LEN],
        )
    }

    #[test]
    fn header_round_trip() {
        let header = sample_header();
        let bytes = header.to_bytes();
        assert_eq!(bytes.len(), HEADER_LEN);

        let (parsed, consumed) = VaultHeader::from_bytes(&bytes).unwrap();
        assert_eq!(consumed, HEADER_LEN);
        assert_eq!(parsed, header);
    }

    #[test]
    fn rejects_bad_magic() {
        let mut bytes = sample_header().to_bytes();
        bytes[0] = b'X';
        assert_eq!(VaultHeader::from_bytes(&bytes), Err(FormatError::BadMagic));
    }

    #[test]
    fn rejects_short_input() {
        let bytes = [0u8; 4];
        assert_eq!(VaultHeader::from_bytes(&bytes), Err(FormatError::TooShort));
    }

    #[test]
    fn rejects_unsupported_version() {
        let mut bytes = sample_header().to_bytes();
        bytes[MAGIC.len()] = 99;
        assert_eq!(
            VaultHeader::from_bytes(&bytes),
            Err(FormatError::UnsupportedVersion(99))
        );
    }

    #[test]
    fn rejects_unsupported_kdf_id() {
        let mut bytes = sample_header().to_bytes();
        bytes[MAGIC.len() + 1] = 42;
        assert_eq!(
            VaultHeader::from_bytes(&bytes),
            Err(FormatError::UnsupportedKdf(42))
        );
    }

    #[test]
    fn rejects_unsupported_cipher_id() {
        let mut bytes = sample_header().to_bytes();
        let cipher_id_pos = MAGIC.len() + 1 + 1 + 4 + 4 + 4;
        bytes[cipher_id_pos] = 42;
        assert_eq!(
            VaultHeader::from_bytes(&bytes),
            Err(FormatError::UnsupportedCipher(42))
        );
    }

    #[test]
    fn encode_decode_vault_round_trip() {
        let header = sample_header();
        let payload = b"encrypted-bytes-go-here";

        let file_bytes = encode_vault(&header, payload);
        let (parsed_header, parsed_payload) = decode_vault(&file_bytes).unwrap();

        assert_eq!(parsed_header, header);
        assert_eq!(parsed_payload, payload);
    }
}
