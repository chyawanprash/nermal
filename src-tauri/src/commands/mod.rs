pub mod notes;
pub mod vault;

use crate::models::vault::VaultPayload;
use crate::vault::crypto;
use crate::vault::format::{self, FormatError, VaultHeader};
use crate::vault::storage;

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
