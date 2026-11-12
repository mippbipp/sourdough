import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nitro",
  bunVersion: "1.4.x",
  installCommand: "bun install --frozen-lockfile",
  buildCommand:
    "bun run --cwd ../../packages/backend convex deploy --cmd='bun run --cwd ../../apps/web build'",
};
