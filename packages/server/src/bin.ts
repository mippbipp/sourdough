import { BunRuntime, BunServices, BunStdio } from "@effect/platform-bun";
import { Effect } from "effect";

import { runCli } from "./cli.ts";

const program = runCli(process.argv.slice(2)).pipe(
  Effect.provide([BunServices.layer, BunStdio.layer])
);

BunRuntime.runMain(program);
