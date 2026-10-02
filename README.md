# sourdough

sourdough is starter turborepo template. React + TanStack Start frontend, Convex backend, Vercel hosting, Rust Cargo workspace for shared crates.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Convex** - Reactive backend-as-a-service platform
- **Turborepo** - Optimized monorepo build system
- **Rust workspace** - Shared crates in `crates/*`, discovered by Turborepo as the `sourdough-rust` package

## Getting started

- Nix users: run `direnv allow` once so `.envrc` loads the flake toolchain and sets `VERCEL_ENV=development`.
- The flake also provides the Rust toolchain (stable via rust-overlay, plus `cargo-edit`), so `cargo` and `rustc` are on `PATH` with no extra step.

```bash
pnpm install
```

## Environment setup

Shared env vars live in dotenvx-encrypted `.env.development` / `.env.production`
at the repo root. They are safe to commit; private keys stay in `.env.keys`
(gitignored — share it with collaborators out of band, once).

```bash
# point dev at your Convex dev deployment
pnpm dotenvx set VITE_CONVEX_URL <dev-url> -f .env.development
# point prod at your Convex prod deployment
pnpm dotenvx set VITE_CONVEX_URL <prod-url> -f .env.production
```

`VERCEL_ENV` selects the file (defaults to `development` via `.envrc`);
prefix any command with `pnpm with-env` to inject decrypted values.

## Convex setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
pnpm --f backend run dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application.

Then, run the development server:

```bash
pnpm dev
```

This starts the web app and `convex dev` together. The app talks to your Convex dev deployment.

## UI customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@sourdough/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Rust workspace

The repo root holds a virtual Cargo workspace. `Cargo.toml` sets `[workspace.metadata] name = "sourdough-rust"`. That name is the identity Turborepo uses in its package graph. This follows the upstream [Turborepo Rust guide](https://turborepo.dev/docs/guides/tools/rust). `turbo.jsonc` opts in with `experimentalCargoWorkspaces` and `experimentalTaskCommand`, so each crate shows up as a filterable package alongside the JS ones.

To add a crate, create `crates/<name>/Cargo.toml`, add shared deps to `[workspace.dependencies]` if other crates need them. Turborepo picks up the new crate with no `turbo.jsonc` change unless it needs custom inputs or outputs.

## Deployment

### Vercel services

- Target: web
- Config: `apps/web/vercel.ts` (typed IaC; edit here, not the dashboard)
- First CLI deploy only: `vercel link` (one-time, links this repo to the Vercel project)
- Preview deploy: `pnpm run deploy` (syncs `.env.development` to the Preview env, then deploys)
- Production deploy: `pnpm run deploy:prod` (syncs `.env.production` to the Production env, then deploys)

## Project structure

```txt
sourdough/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── backend/     # Convex backend functions and schema
│   ├── env/         # Shared environment-variable schemas
│   ├── config/      # Shared tsconfig.base.json
├── crates/
│   ├── macros/        # Proc-macro derives (DomainError)
│   ├── layered-error/ # LayeredError<D> domain vs system errors
├── tools/
│   ├── scripts/     # Repo tooling
│   ├── oxlint/      # Vendored oxlint anti-slop plugins
```

## Available scripts

- `pnpm dev`: Start all applications in development mode (env via dotenvx)
- `pnpm build`: Build all applications
- `pnpm ox` / `pnpm ox:fix`: Lint + format check / autofix across JS (oxlint, oxfmt) and Rust (clippy, rustfmt) via Turbo
- `pnpm clean`: Workspace `clean` tasks plus `git clean` of `node_modules`, `.turbo`, and Rust `target/`
- `pnpm with-env`: Run a command with decrypted dotenvx env, e.g. `pnpm with-env <cmd>`
- `pnpm deploy`: Sync preview env, then create a Vercel preview deployment
- `pnpm deploy:prod`: Sync production env, then deploy to Vercel production (the Vercel build pushes Convex functions)
