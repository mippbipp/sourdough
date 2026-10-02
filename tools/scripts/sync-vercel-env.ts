import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { config as dotenvxConfig } from "@dotenvx/dotenvx";

// dotenvx file that owns the key list for each Vercel environment. Values
// are decrypted in-process via dotenvx, so run directly, e.g.
// `pnpm run env:preview` / `pnpm run env:production` (no `with-env` needed).
const ENV_FILES = {
  development: [".env.development"],
  preview: [".env.development"],
  production: [".env.production"],
} satisfies Record<string, string[]>;

const VALID_ENVIRONMENTS = new Set(Object.keys(ENV_FILES));

const VERCEL_COMMAND = ["pnpm", "exec", "vercel"] as const;

const SKIP_KEYS = new Set<string>();

const OVERRIDE_KEYS = new Map<string, string>();

// dotenvx stores its public keys as plaintext entries; never sync those.
const isDotenvxPublicKey = (key: string) => key.startsWith("DOTENV_PUBLIC_KEY");

// Values left as ciphertext mean the private key (.env.keys) is missing.
const isStillEncrypted = (value: string) => value.startsWith("encrypted:");

const args = process.argv.slice(2);

const separatorIndex = args.indexOf("--");

const scriptArgs = separatorIndex === -1 ? args : args.slice(0, separatorIndex);

const forwardedArgs =
  separatorIndex === -1 ? [] : args.slice(separatorIndex + 1);

// SAFETY: scriptArgs[0] passed membership in VALID_ENVIRONMENTS, which is derived from ENV_FILES keys; the "preview" fallback is a key.
const environment = (
  VALID_ENVIRONMENTS.has(scriptArgs[0] ?? "") ? scriptArgs[0] : "preview"
) as keyof typeof ENV_FILES;

const remainingArgs = scriptArgs.slice(
  VALID_ENVIRONMENTS.has(scriptArgs[0] ?? "") ? 1 : 0
);

// Split remaining args into env-file paths and passthrough Vercel CLI flags.
// A bare token counts as a file only when it exists on disk, so flags and their
// values (e.g. `--scope my-team`) forward correctly regardless of argument order.
const files: string[] = [];

const passthroughArgs: string[] = [];

for (const arg of remainingArgs) {
  if (!arg.startsWith("-") && existsSync(arg)) {
    files.push(arg);
  } else {
    passthroughArgs.push(arg);
  }
}

const vercelArgs = [...passthroughArgs, ...forwardedArgs];

const envFiles = files.length > 0 ? files : ENV_FILES[environment];

if (envFiles.length === 0) {
  console.log("No env files configured for this Vercel stack.");
  process.exit(0);
}

const env = new Map<string, string>();

const missing: string[] = [];

for (const file of envFiles) {
  if (!existsSync(file)) {
    console.warn(`Skipping missing env file: ${file}`);
  }
}

// Decrypt in-process so callers don't need the `with-env` wrapper.
// override:false (default) keeps already-exported vars winning over files.
const existingFiles = envFiles.filter((file) => existsSync(file));

const loaded =
  existingFiles.length > 0
    ? dotenvxConfig({ path: existingFiles, quiet: true })
    : undefined;

const parsed = loaded?.parsed ?? {};

// dotenvx-encrypted files keep key names in plaintext; values come from the
// decrypted result (also mirrored onto process.env by config()).
const names = Object.keys(parsed).filter(
  (key) => !SKIP_KEYS.has(key) && !isDotenvxPublicKey(key)
);

for (const key of names) {
  const value = OVERRIDE_KEYS.get(key) ?? process.env[key] ?? parsed[key];

  if (value === undefined || isStillEncrypted(value)) {
    missing.push(key);
  } else {
    env.set(key, value);
  }
}

if (missing.length > 0) {
  console.error(
    `Missing or undecryptable values for: ${missing.join(", ")} (from ${existingFiles.join(", ")})\nEnsure .env.keys is present and the keys hold real values, e.g. \`pnpm dotenvx set KEY value -f .env.${environment}\`.`
  );
  process.exit(1);
}

if (env.size === 0) {
  console.log("No Vercel env vars found to sync.");
  process.exit(0);
}

const LOCAL_VALUE_PATTERN = /localhost|127\.0\.0\.1|0\.0\.0\.0|^file:/iu;

const localKeys = env
  .entries()
  .filter(([, value]) => LOCAL_VALUE_PATTERN.test(value))
  .map(([key]) => key)
  .toArray();

if (localKeys.length > 0) {
  console.warn(
    `Warning: ${localKeys.join(", ")} look${localKeys.length === 1 ? "s" : ""} like local-only value(s). Update them in your .env file(s) and re-run this sync if your deployed app should not point at local endpoints.`
  );
}

console.log(`Syncing ${env.size} env var(s) to Vercel ${environment}.`);

for (const [key, value] of env.entries()) {
  const result = spawnSync(
    VERCEL_COMMAND[0],
    [
      ...VERCEL_COMMAND.slice(1),
      "env",
      "add",
      key,
      environment,
      "--force",
      "--yes",
      "--non-interactive",
      ...vercelArgs,
    ],
    {
      input: `${value}\n`,
      stdio: ["pipe", "inherit", "inherit"],
      encoding: "utf8",
      // Windows resolves bunx/npx/pnpm via .cmd shims, which need a shell
      shell: process.platform === "win32",
    }
  );

  if (result.error !== undefined) {
    console.error(`Failed to sync ${key}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Failed to sync ${key}`);
    process.exit(result.status ?? 1);
  }
}

console.log("Vercel env sync complete. Redeploy for changes to take effect.");
