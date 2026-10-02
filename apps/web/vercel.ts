import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nitro",
  installCommand: "pnpm install",
  buildCommand: "pnpm -F backend exec convex deploy --cmd='pnpm -F web build'",
};
