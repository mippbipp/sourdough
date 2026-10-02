# dotenvx-encrypted env files as the env store

Shared env lives in dotenvx-encrypted `.env.development` / `.env.production` at the repo root, committed as ciphertext, with private keys in gitignored `.env.keys`. `tools/scripts/sync-vercel-env.ts` pushes decrypted values to the matching Vercel environment. We rejected the Vercel dashboard as source of truth (unreviewable, unversioned) and plain `.env` files (leak risk).

## Consequences

- Encrypted files intentionally ship in Vercel deploys as ciphertext; project env vars shadow them at runtime.
- A var missing from Vercel fails the build loudly via `z.url()` instead of silently misbehaving.
