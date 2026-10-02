//! Bifunctor error pattern: `LayeredError<D>` enforces the Domain vs System
//! split at compile time. System errors are strictly flattened into `anyhow::Error`.

use thiserror::Error;

/// Enforces the Domain vs System split.
/// - Domain errors (D) are explicitly typed and actionable.
/// - System errors are opaque, un-actionable `anyhow::Error`s.
#[derive(Debug, Error)]
pub enum LayeredError<D: std::error::Error + 'static> {
    #[error(transparent)]
    Domain(D),

    // thiserror natively supports anyhow::Error in transparent variants!
    #[error(transparent)]
    System(anyhow::Error),
}

impl<D: std::error::Error + 'static> LayeredError<D> {
    /// Widen the domain type. System errors pass through unchanged.
    pub fn lift_domain<D2: std::error::Error + From<D> + 'static>(self) -> LayeredError<D2> {
        match self {
            LayeredError::Domain(d) => LayeredError::Domain(D2::from(d)),
            LayeredError::System(s) => LayeredError::System(s),
        }
    }
}

// Re-export the macro
pub use macros::DomainError;
