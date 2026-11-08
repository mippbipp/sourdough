import { defineContract, implement } from "@sourdough/capability";
import { Effect, Schema } from "effect";

const statusContract = defineContract("status", {
  annotations: { idempotent: true, readOnly: true },
  description: "Report the server name and whether it is healthy",
  failure: Schema.Never,
  input: Schema.Struct({}),
  output: Schema.Struct({
    healthy: Schema.Boolean,
    name: Schema.String,
  }),
});

export const status = implement(statusContract, () =>
  Effect.succeed({ healthy: true, name: "sourdough" })
);

export const capabilities = [status] as const;
