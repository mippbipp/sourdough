import { NodeServices } from "@effect/platform-node";
import { layer } from "@effect/vitest";
import { Array as Arr, Effect, Layer, Option, Schema } from "effect";
import { CliOutput } from "effect/cli";
import { TestConsole } from "effect/testing";

import { status } from "../src/capabilities.ts";
import { runCli } from "../src/cli.ts";

const TestLayer = Layer.mergeAll(
  TestConsole.layer,
  CliOutput.layer(CliOutput.defaultFormatter({ colors: false }))
).pipe(Layer.provideMerge(NodeServices.layer));

const decodeStatus = Schema.decodeUnknownEffect(
  Schema.fromJsonString(status.contract.output)
);

layer(TestLayer)("cli", (it) => {
  it.effect("runs the status capability as a subcommand", () =>
    Effect.gen(function* () {
      yield* runCli(["status"]);

      const lines = yield* TestConsole.logLines;
      const last = String(Option.getOrUndefined(Arr.last(lines)));
      const output = yield* decodeStatus(last);

      assert.deepStrictEqual(output, { healthy: true, name: "sourdough" });
    })
  );
});
