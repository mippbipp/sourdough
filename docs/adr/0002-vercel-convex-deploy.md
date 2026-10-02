# Vercel deploys release web and Convex together

There is one release action: deploy to Vercel, via `git push` (Git integration) or the root `deploy` (preview) / `deploy:prod` (production) scripts. `apps/web/vercel.ts` serves two purposes: it is IaC for the project's install/build settings — a typed `VercelConfig` (`@vercel/config/v1`), co-located with the deployable package instead of dashboard click-ops or a repo-root file, type-checked like any other source — and it chains the backend release into the build: `convex deploy --cmd='pnpm -F web build'` pushes Convex functions (authenticated via `CONVEX_DEPLOY_KEY`, provisioned automatically by the Convex Vercel integration in Preview and Production — verified with `vercel env ls`) and only then builds the TanStack Start app. Every Vercel deployment is therefore an atomic backend+frontend release, versioned together per ADR-0001. For Preview builds the URL is not the synced one: `convex deploy` provisions a fresh isolated Convex deployment per Git branch and injects its URL into the frontend build, so the synced Preview `VITE_CONVEX_URL` is only a fallback — preview frontends talk to preview backends. Build-time and runtime vars come from Vercel project env, populated from the dotenvx files by the deploy scripts per ADR-0003.

## Consequences

- A bare `git push` ships code but not env: run the sync step (the `deploy` scripts do this first) whenever vars change, or the build runs against stale project env.
- Change build/install commands in `apps/web/vercel.ts`, not the dashboard; the file overrides dashboard settings.
- Env ownership is split: the sync script owns dotenvx-managed vars (`VITE_CONVEX_URL`); the Convex integration owns `CONVEX_DEPLOY_KEY`. Don't remove the integration key or Vercel builds lose backend deploys.
- `convex deploy` runs on every Vercel build of this project, so there is no separate backend deploy step.
- Preview backends are fresh per branch with no shared data from dev or prod, so previews start empty; seed them with a `--preview-run` function on the build command if previews need initial data.
