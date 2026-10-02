import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Minimal import.meta typing for the web entry. Mirrors the `env` member of
// vite/client's ImportMeta augmentation without taking a vite dependency:
// Vite guarantees import.meta.env is a string dictionary in client builds.
declare global {
  interface ImportMeta {
    readonly env: Record<string, string | undefined>;
  }
}

const convexUrlSchema = (exampleHost: string) =>
  z.url().refine((url) => new URL(url).hostname !== exampleHost, {
    message: `Replace the ${exampleHost} placeholder before running the app`,
  });

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_CONVEX_URL: convexUrlSchema("example.convex.cloud"),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
