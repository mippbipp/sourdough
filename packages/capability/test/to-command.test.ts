import { BunServices } from "@effect/platform-bun";
import { layer } from "@effect/vitest";
import { Array as Arr, Effect, Layer, Option, Schema } from "effect";
import { CliOutput, Command } from "effect/cli";
import { TestConsole } from "effect/testing";

import { defineContract, implement, toCommand } from "../src/index.ts";
import { Greeter, NotFound, echo, greet, mixed } from "./fixtures.ts";

const TestLayer = Layer.mergeAll(
  TestConsole.layer,
  CliOutput.layer(CliOutput.defaultFormatter({ colors: false })),
  Greeter.layer
).pipe(Layer.provideMerge(BunServices.layer));

const run = <const Name extends string, Input, E, R, ContextInput>(
  command: Command.Command<Name, Input, ContextInput, E, R>,
  args: readonly string[]
) => Command.runWith(command, { version: "0.0.0" })(args);

const lastLine = TestConsole.logLines.pipe(
  Effect.map((lines) => String(Option.getOrUndefined(Arr.last(lines))))
);

const lastJson = <S extends Schema.Top>(schema: S) => {
  const decode = Schema.decodeUnknownEffect(Schema.fromJsonString(schema));

  return lastLine.pipe(Effect.flatMap(decode));
};

const reservedJson = implement(
  defineContract("reservedJson", {
    description: "A capability with a json field",
    failure: Schema.Never,
    input: Schema.Struct({ json: Schema.String }),
    output: Schema.String,
  }),
  ({ json }) => Effect.succeed(json)
);

layer(TestLayer)("toCommand", (it) => {
  it.effect("maps fields to flags and prints encoded JSON", () =>
    Effect.gen(function* () {
      yield* run(toCommand(echo), ["--text", "hi", "--times", "2"]);

      const output = yield* lastJson(echo.contract.output);

      assert.deepStrictEqual(output, { text: "hihi" });
    })
  );

  it.effect("lets optional fields be omitted", () =>
    Effect.gen(function* () {
      yield* run(toCommand(echo), ["--text", "hi"]);

      const output = yield* lastJson(echo.contract.output);

      assert.deepStrictEqual(output, { text: "hi" });
    })
  );

  it.effect("handles booleans, literals, and JSON-valued fields", () =>
    Effect.gen(function* () {
      yield* run(toCommand(mixed), [
        "--enabled",
        "--mode",
        "slow",
        "--tags",
        '["a","b"]',
      ]);

      const output = yield* lastJson(mixed.contract.output);

      assert.deepStrictEqual(output, {
        enabled: true,
        mode: "slow",
        tags: ["a", "b"],
      });
    })
  );

  it.effect("renders positional input through the supplied function", () =>
    Effect.gen(function* () {
      const command = toCommand(greet, {
        positional: ["name"],
        render: (output) => `>> ${output.greeting}`,
      });

      yield* run(command, ["rat"]);

      const line = yield* lastLine;

      assert.strictEqual(line, ">> hello rat");

      yield* run(command, ["rat", "--json"]);

      const output = yield* lastJson(greet.contract.output);

      assert.deepStrictEqual(output, { greeting: "hello rat" });
    })
  );

  it.effect("keeps the capability's failure typed", () =>
    Effect.gen(function* () {
      const error = yield* run(toCommand(greet), ["--name", "nobody"]).pipe(
        Effect.flip
      );

      assert.instanceOf(error, NotFound);
    })
  );

  it.effect("rejects an input field that collides with --json", () =>
    Effect.gen(function* () {
      const message = yield* Effect.try({
        try: () => toCommand(reservedJson, { render: (output) => output }),
        catch: String,
      }).pipe(Effect.flip);

      assert.include(
        message,
        "Input field `json` conflicts with the reserved `--json` flag"
      );
    })
  );
});
