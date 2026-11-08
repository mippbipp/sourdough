import { Context, Effect, Layer, Schema, String } from "effect";

import { defineContract, implement } from "../src/index.ts";

export class NotFound extends Schema.TaggedError<
  NotFound,
  { readonly brand: unique symbol }
>()("NotFound", {
  subject: Schema.String,
}) {}

export class Greeter extends Context.Service<
  Greeter,
  { readonly greet: (name: string) => Effect.Effect<string> }
>()("@sourdough/capability/test/fixtures/Greeter") {
  public static readonly layer = Layer.succeed(this, {
    greet: (name: string) => Effect.succeed(`hello ${name}`),
  });
}

const echoContract = defineContract("echo", {
  annotations: { idempotent: true, readOnly: true },
  description: "Repeat text a number of times",
  failure: Schema.Never,
  input: Schema.Struct({
    text: Schema.String.annotate({ description: "Text to repeat" }),
    times: Schema.optional(Schema.Finite),
  }),
  output: Schema.Struct({ text: Schema.String }),
});

export const echo = implement(echoContract, ({ text, times }) =>
  Effect.succeed({ text: String.repeat(times ?? 1)(text) })
);

const greetContract = defineContract("greet", {
  description: "Greet someone by name",
  failure: NotFound,
  input: Schema.Struct({ name: Schema.String }),
  output: Schema.Struct({ greeting: Schema.String }),
});

export const greet = implement(greetContract, ({ name }) =>
  name === "nobody"
    ? Effect.fail(NotFound.make({ subject: name }))
    : Greeter.use((greeter) => greeter.greet(name)).pipe(
        Effect.map((greeting) => ({ greeting }))
      )
);

const mixedContract = defineContract("mixed", {
  description: "Echo a mixed input back",
  failure: Schema.Never,
  input: Schema.Struct({
    enabled: Schema.Boolean,
    mode: Schema.Literals(["fast", "slow"]),
    tags: Schema.Array(Schema.String),
  }),
  output: Schema.Struct({
    enabled: Schema.Boolean,
    mode: Schema.Literals(["fast", "slow"]),
    tags: Schema.Array(Schema.String),
  }),
});

export const mixed = implement(mixedContract, (input) => Effect.succeed(input));

const noArgsContract = defineContract("noArgs", {
  description: "Return a fixed value without input",
  failure: Schema.Never,
  input: Schema.Struct({}),
  output: Schema.String,
});

export const noArgs = implement(noArgsContract, () => Effect.succeed("ready"));
