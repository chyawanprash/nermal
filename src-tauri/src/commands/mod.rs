pub mod notes;
pub mod vault;

use crate::models::vault::VaultPayload;
use crate::vault::crypto;
use crate::vault::format::{self, FormatError, VaultHeader};
use crate::vault::storage;

pub const MIN_PASSWORD_LENGTH: usize = 8;
pub const MAX_PASSWORD_LENGTH: usize = 128;

#[derive(Debug, thiserror::Error)]
pub enum VaultError {
    #[error("vault file not found")]
    NotFound,
    #[error("{0}")]
    Format(#[from] FormatError),
    #[error("{0}")]
    Crypto(#[from] crypto::CryptoError),
    #[error("failed to save vault: {0}")]
    SaveFailed(String),
    #[error("no vault is currently unlocked")]
    NoVaultOpen,
    #[error("note not found: {0}")]
    NoteNotFound(String),
    #[error("password must be at least {MIN_PASSWORD_LENGTH} characters")]
    PasswordTooShort,
    #[error("password must be at most {MAX_PASSWORD_LENGTH} characters")]
    PasswordTooLong,
}

pub(crate) fn validate_password_length(password: &str) -> Result<(), VaultError> {
    if password.len() < MIN_PASSWORD_LENGTH {
        return Err(VaultError::PasswordTooShort);
    }
    if password.len() > MAX_PASSWORD_LENGTH {
        return Err(VaultError::PasswordTooLong);
    }
    Ok(())
}

impl serde::Serialize for VaultError {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

pub(crate) fn persist(vault: &crate::OpenVault) -> Result<(), VaultError> {
    let payload = VaultPayload {
        name: vault.name.clone(),
        notes: vault.notes.clone(),
    };
    let plaintext =
        serde_json::to_vec(&payload).map_err(|e| VaultError::SaveFailed(e.to_string()))?;

    let nonce = crypto::generate_nonce();
    let ciphertext = crypto::encrypt(&*vault.key, &nonce, &plaintext)?;

    let header = VaultHeader::new(vault.kdf_params, vault.salt, nonce);
    let file_data = format::encode_vault(&header, &ciphertext);

    storage::write_vault(&vault.path, &file_data)
        .map_err(|e| VaultError::SaveFailed(e.to_string()))?;

    Ok(())
}
