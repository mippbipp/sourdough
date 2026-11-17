import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  buildCommand:
    "bun run --cwd ../../packages/backend convex deploy --cmd='bun run --cwd ../../apps/web build'",
  bunVersion: "1.4.x",
  framework: "nitro",
  installCommand: "bun install --frozen-lockfile",
};
