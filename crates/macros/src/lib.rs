use proc_macro::TokenStream;
use quote::quote;
use syn::{DeriveInput, parse_macro_input};

/// Generates a generic `From` impl that wraps this type into `LayeredError::Domain`.
///
/// Must be combined with `thiserror::Error` (or a manual `Error` impl).
#[proc_macro_derive(DomainError)]
pub fn derive_domain_error(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;

    if !input.generics.params.is_empty() {
        return syn::Error::new_spanned(
            &input.generics,
            "DomainError does not support generic types",
        )
        .to_compile_error()
        .into();
    }

    let expanded = quote! {
        impl ::std::convert::From<#name> for ::layered_error::LayeredError<#name>
        {
            fn from(err: #name) -> Self {
                ::layered_error::LayeredError::Domain(err)
            }
        }
    };

    TokenStream::from(expanded)
}
