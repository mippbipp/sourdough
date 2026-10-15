import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const convexUrlSchema = (exampleHost: string) =>
  z.url().refine((url) => new URL(url).hostname !== exampleHost, {
    message: `Replace the ${exampleHost} placeholder before running the app`,
  });

export function createWebEnv(runtimeEnv: Record<string, string | undefined>) {
  return createEnv({
    clientPrefix: "VITE_",
    client: {
      VITE_CONVEX_URL: convexUrlSchema("example.convex.cloud"),
    },
    runtimeEnv,
    emptyStringAsUndefined: true,
  });
}
