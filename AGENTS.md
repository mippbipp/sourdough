# Agents

## Package manager

This repo uses bun (`packageManager` in `package.json`). When a skill or doc
says `npm`, `npx`, `pnpm` or `yarn`, use `bun` or `bunx` instead.

Lint, format and typecheck with `bun run ox`; fix with `bun run ox:fix`.

## Using Convex

Before editing `packages/backend/convex/`, read
`packages/backend/convex/_generated/ai/guidelines.md`.

## Using ui-sdk

The ui-sdk docs are in `packages/ui/node_modules/@ui-sdk/react/docs/`.

ui-sdk provides the behavior and shadcn provides the design:

- Components in `packages/ui/src/components/` wrap ui-sdk parts and style them
  with the shadcn (base-lyra) Tailwind classes and theme variables in
  `packages/ui/src/styles/globals.css`.
- Build interactive components on ui-sdk. `shadcn add` generates Base UI
  wrappers, so use it only for markup-only components (card, empty, skeleton).
  When shadcn has the same component, copy its base-lyra classes so the look
  matches, then swap Base UI state attributes for ui-sdk's (`data-highlighted`
  for `:focus`, `data-destructive` for `data-[variant=destructive]`, and so on).
- Tests for the wrappers live in `packages/ui/test/` (`bun run test` in
  `packages/ui`).

## Building UI

When frontend skills disagree, the one higher in this list wins:

1. `ui-sdk` and `shadcn` decide how components behave and look (see above).
2. `vercel-composition-patterns` for component APIs: compound components, and
   `children` or explicit variants in place of boolean props.
3. `react-doctor` checks the code. Run `bunx react-doctor --verbose --scope changed`
   after React changes and `bunx react-doctor design --verbose` before a PR. The
   pre-commit hook blocks on react-doctor warnings.
4. `agent-browser skills get modern-web-guidance` verifies motion, overlays,
   images and theming in a real browser. Where ui-sdk ships the component, keep
   ui-sdk's implementation and take only the guide's browser checks.
5. `design-taste-frontend` is for public landing and marketing pages only, run
   with `--keep palette,type`. App screens built from `packages/ui` keep the
   base-lyra theme.

React Compiler is on (`apps/web/vite.config.ts`), so components need no
`useMemo`, `useCallback` or `memo` for render performance.

## Using Effect

This repo uses Effect 4. Before writing any Effect code, read
`node_modules/effect/AGENTS.md` **completely**, and follow the
links in the file when required. For APIs the guide doesn't 
cover, search the source in `node_modules/effect/src`.

## Using Turborepo

Before changing `turbo.jsonc` or turbo commands, read `docs/README.md` in the
installed `turbo` package (find it with
`bun -p "require.resolve('turbo/package.json')"`), then the pages it points to.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`mippbipp/sourdough`, via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary, each label string equal to its role name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
