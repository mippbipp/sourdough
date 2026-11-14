# Agents

## Using Convex

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`packages/backend/convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

## Using ui-sdk

`@ui-sdk/react` and `@ui-sdk/core` are dependencies of `packages/ui`, so their
docs live under `packages/ui/node_modules/@ui-sdk/react/docs/`.

Before using ui-sdk, follow the `ui-sdk` skill (`.agents/skills/ui-sdk`) and read
`packages/ui/node_modules/@ui-sdk/react/docs/llms.txt`. To build a new component,
also search `core.md` in that folder by heading (it's over 300 KB, don't read it
whole), and read `rendering.md` next to it.

ui-sdk provides the behavior and shadcn provides the design:

- Components in `packages/ui/src/components/` wrap ui-sdk parts and style them
  with the shadcn (base-lyra) Tailwind classes and theme variables in
  `packages/ui/src/styles/globals.css`.
- Don't run `shadcn add` for interactive components, since it generates Base UI
  wrappers. Build the component on ui-sdk instead. When shadcn has the same
  component, copy its base-lyra classes so the look matches, then swap Base UI
  state attributes for ui-sdk's (`data-highlighted` for `:focus`,
  `data-destructive` for `data-[variant=destructive]`, and so on).
- Markup-only components with no behavior (card, empty, skeleton) can still come
  from `shadcn add`.
- Tests for the wrappers live in `packages/ui/test/` (`bun run test` in
  `packages/ui`).

## Learning more about Effect

This repository uses the Effect Typescript library.

Before writing any Effect code, first read `node_modules/effect/AGENTS.md`
**completely**, and follow the links in the file when required.

If you need to learn more about particular Effect apis and concepts that the
guide doesn't cover, search through the source code in `node_modules/effect/src`.

### Issue tracker

Issues live in GitHub Issues (`mippbipp/sourdough`, via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary, each label string equal to its role name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
