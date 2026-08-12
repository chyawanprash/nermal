//! Compression for the encrypted vault blob.
//!
//! Applied once over the whole serialized `VaultPayload`, not per-record,
//! so zstd gets to exploit redundancy across all notes rather than just
//! within each one.

use thiserror::Error;

/// Balances ratio against the latency of a save/unlock happening on every
/// keystroke's debounce tick; raise it if vaults are large and infrequently
/// written.
const COMPRESSION_LEVEL: i32 = 3;

#[derive(Debug, Error)]
pub enum CompressionError {
    #[error("failed to compress vault data: {0}")]
    Compress(std::io::Error),
    #[error("failed to decompress vault data: {0}")]
    Decompress(std::io::Error),
}

pub fn compress(data: &[u8]) -> Result<Vec<u8>, CompressionError> {
    zstd::stream::encode_all(data, COMPRESSION_LEVEL).map_err(CompressionError::Compress)
}

pub fn decompress(data: &[u8]) -> Result<Vec<u8>, CompressionError> {
    zstd::stream::decode_all(data).map_err(CompressionError::Decompress)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip_preserves_data() {
        let data = b"the quick brown fox jumps over the lazy dog ".repeat(50);
        let compressed = compress(&data).unwrap();
        let decompressed = decompress(&compressed).unwrap();
        assert_eq!(decompressed, data);
    }

    #[test]
    fn compresses_redundant_data() {
        let data = b"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            .repeat(20);
        let compressed = compress(&data).unwrap();
        assert!(compressed.len() < data.len());
    }

    #[test]
    fn decompress_rejects_garbage() {
        assert!(decompress(b"not zstd data").is_err());
    }
}
