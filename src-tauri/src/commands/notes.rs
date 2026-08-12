use tauri::State;

use super::{persist, VaultError};
use crate::models::note::Note;
use crate::AppState;

#[tauri::command]
pub fn list_notes(state: State<'_, AppState>) -> Result<Vec<Note>, VaultError> {
    let guard = state.vault.lock().unwrap();
    let vault = guard.as_ref().ok_or(VaultError::NoVaultOpen)?;
    Ok(vault.notes.clone())
}

#[tauri::command]
pub fn get_note(id: String, state: State<'_, AppState>) -> Result<Note, VaultError> {
    let guard = state.vault.lock().unwrap();
    let vault = guard.as_ref().ok_or(VaultError::NoVaultOpen)?;
    vault
        .notes
        .iter()
        .find(|n| n.id == id)
        .cloned()
        .ok_or(VaultError::NoteNotFound(id))
}

#[tauri::command]
pub fn create_note(
    title: String,
    content: String,
    state: State<'_, AppState>,
) -> Result<Note, VaultError> {
    let mut guard = state.vault.lock().unwrap();
    let vault = guard.as_mut().ok_or(VaultError::NoVaultOpen)?;

    let now = chrono::Utc::now().to_rfc3339();
    let note = Note {
        id: uuid::Uuid::new_v4().to_string(),
        title,
        content,
        created_at: now.clone(),
        updated_at: now,
    };

    vault.notes.push(note.clone());
    persist(vault)?;
    Ok(note)
}

#[tauri::command]
pub fn update_note(
    id: String,
    title: String,
    content: String,
    state: State<'_, AppState>,
) -> Result<Note, VaultError> {
    let mut guard = state.vault.lock().unwrap();
    let vault = guard.as_mut().ok_or(VaultError::NoVaultOpen)?;

    let note = vault
        .notes
        .iter_mut()
        .find(|n| n.id == id)
        .ok_or(VaultError::NoteNotFound(id))?;
    note.title = title;
    note.content = content;
    note.updated_at = chrono::Utc::now().to_rfc3339();

    let result = note.clone();
    persist(vault)?;
    Ok(result)
}

#[tauri::command]
pub fn delete_note(id: String, state: State<'_, AppState>) -> Result<(), VaultError> {
    let mut guard = state.vault.lock().unwrap();
    let vault = guard.as_mut().ok_or(VaultError::NoVaultOpen)?;

    let before = vault.notes.len();
    vault.notes.retain(|n| n.id != id);
    if vault.notes.len() == before {
        return Err(VaultError::NoteNotFound(id));
    }

    persist(vault)?;
    Ok(())
}
