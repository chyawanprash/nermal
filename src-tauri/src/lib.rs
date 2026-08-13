pub mod commands;
pub mod models;
pub mod vault;

use std::path::PathBuf;
use std::sync::Mutex;

use zeroize::Zeroizing;

use crate::vault::crypto::{KdfParams, KEY_LEN, SALT_LEN};
use models::note::Note;

pub struct OpenVault {
    pub path: PathBuf,
    pub name: String,
    pub key: Zeroizing<[u8; KEY_LEN]>,
    pub kdf_params: KdfParams,
    pub salt: [u8; SALT_LEN],
    pub notes: Vec<Note>,
}

#[derive(Default)]
pub struct AppState {
    pub vault: Mutex<Option<OpenVault>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::vault::create_vault,
            commands::vault::open_vault,
            commands::vault::unlock_vault,
            commands::vault::lock_vault,
            commands::vault::close_vault,
            commands::vault::change_vault_password,
            commands::vault::export_vault,
            commands::notes::list_notes,
            commands::notes::get_note,
            commands::notes::create_note,
            commands::notes::update_note,
            commands::notes::delete_note,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
