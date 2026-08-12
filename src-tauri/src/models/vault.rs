use serde::{Deserialize, Serialize};

use super::note::Note;

/// The plaintext payload stored inside the encrypted vault file.
#[derive(Debug, Serialize, Deserialize)]
pub struct VaultPayload {
    pub name: String,
    pub notes: Vec<Note>,
}

/// Returned to the frontend for a vault that has been opened but not yet unlocked.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultSummary {
    pub id: String,
    pub name: String,
    pub path: String,
}

/// Returned to the frontend for an unlocked vault.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultInfo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub note_count: usize,
    pub last_modified_at: String,
}
