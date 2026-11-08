import { NodeRuntime, NodeServices, NodeStdio } from "@effect/platform-node";
import { Effect, Layer } from "effect";

import { runCli } from "./cli.ts";

const program = runCli(process.argv.slice(2)).pipe(
  Effect.provide(Layer.mergeAll(NodeServices.layer, NodeStdio.layer))
);

NodeRuntime.runMain(program);
