use std::fs;
use std::path::Path;

pub fn read_vault(path: &Path) -> Result<Vec<u8>, std::io::Error> {
    fs::read(path)
}

/// Write atomically: write to a temp file, then rename over the target.
pub fn write_vault(path: &Path, data: &[u8]) -> Result<(), std::io::Error> {
    let tmp = path.with_extension("vault.tmp");
    fs::write(&tmp, data)?;
    fs::rename(&tmp, path)?;
    Ok(())
}
