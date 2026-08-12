use std::fs;
use std::path::Path;

pub fn read_vault(path: &Path) -> Result<Vec<u8>, std::io::Error> {
    fs::read(path)
}

/// Write atomically: write to a temp file, then rename over the target.
///
/// The temp name is built by appending `.tmp` to the target's file name
/// (rather than replacing its extension), so this works regardless of the
/// target's extension — e.g. both the vault's own `.nermal` path and an
/// arbitrary export destination chosen by the user.
pub fn write_vault(path: &Path, data: &[u8]) -> Result<(), std::io::Error> {
    let tmp = match path.file_name() {
        Some(name) => {
            let mut tmp_name = name.to_os_string();
            tmp_name.push(".tmp");
            path.with_file_name(tmp_name)
        }
        None => path.with_extension("tmp"),
    };
    fs::write(&tmp, data)?;
    fs::rename(&tmp, path)?;
    Ok(())
}
