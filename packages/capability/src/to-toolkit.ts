import { Array as Arr, Effect, Record, Schema } from "effect";
import type { Layer } from "effect";
import { Tool, Toolkit } from "effect/ai";

import type {
  AnyCapability,
  FailureOf,
  InputOf,
  OutputOf,
  RequirementsOf,
} from "./contract.ts";

const hasNoInputFields = ({ contract }: AnyCapability) =>
  Record.isEmptyReadonlyRecord(contract.input.fields);

// MCP rejects a tool whose parameters encode to an empty struct, so a
// capability with no input fields registers with `Tool.EmptyParams` instead.
const toolFor = (capability: AnyCapability) => {
  const { contract } = capability;

  return Tool.make(contract.name, {
    description: contract.description,
    failure: contract.failure,
    parameters: hasNoInputFields(capability)
      ? Tool.EmptyParams
      : contract.input,
    success: contract.output,
  })
    .annotate(Tool.Readonly, contract.annotations.readOnly)
    .annotate(Tool.Destructive, contract.annotations.destructive)
    .annotate(Tool.Idempotent, contract.annotations.idempotent)
    .annotate(Tool.OpenWorld, contract.annotations.openWorld);
};

type ToolOf<Cap extends AnyCapability> = Tool.Tool<
  Cap["contract"]["name"],
  {
    readonly failure: FailureOf<Cap>;
    readonly failureMode: "error";
    readonly parameters: InputOf<Cap>;
    readonly success: OutputOf<Cap>;
  }
>;

export type ToolsOf<Caps extends readonly AnyCapability[]> = {
  readonly [Cap in Caps[number] as Cap["contract"]["name"]]: ToolOf<Cap>;
};

export interface ToolkitProjection<Caps extends readonly AnyCapability[]> {
  readonly layer: Layer.Layer<
    Tool.HandlersFor<ToolsOf<Caps>>,
    never,
    RequirementsOf<Caps[number]>
  >;
  readonly toolkit: Toolkit.Toolkit<ToolsOf<Caps>>;
}

/**
 * Project capabilities onto an `effect/ai` toolkit. Serve it over MCP with
 * `McpServer.toolkit(projection.toolkit)` and provide `projection.layer`.
 */
export const toToolkit = <const Caps extends readonly AnyCapability[]>(
  capabilities: Caps
): ToolkitProjection<Caps> => {
  const made: unknown = Toolkit.make(...Arr.map(capabilities, toolFor));
  // SAFETY: `Toolkit.make` is variadic over a tuple of tools; `map` over the runtime array cannot carry that tuple type, so `ToolsOf<Caps>` restores it here.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- projection boundary recovers the tool tuple type that map cannot carry.
  const toolkit = made as Toolkit.Toolkit<ToolsOf<Caps>>;

  const layer = toolkit.toLayer(
    Effect.gen(function* buildHandlers() {
      const context = yield* Effect.context<RequirementsOf<Caps[number]>>();

      const handlers: Record<
        string,
        // oxlint-disable-next-line anti-slop/no-unknown-parameters -- the toolkit decodes each tool's parameters before calling; a loop cannot name each capability's input type.
        (parameters: unknown) => Effect.Effect<unknown, unknown>
      > = {};

      for (const capability of capabilities) {
        // SAFETY: `AnyCapability` erased this handler's requirements to `unknown`; they are a subset of `RequirementsOf<Caps[number]>`, which `context` carries.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- projection boundary erases the handler type; RequirementsOf restores it.
        const run = capability.handler as (
          // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Toolkit decodes the parameters schema before calling this handler.
          input: unknown
        ) => Effect.Effect<unknown, unknown, RequirementsOf<Caps[number]>>;

        const decodeInput = Schema.decodeUnknownEffect(
          capability.contract.input
        );

        handlers[capability.contract.name] = hasNoInputFields(capability)
          ? (parameters) =>
              // oxlint-disable-next-line effecttsgo/any-unknown-in-error-context -- projection boundary: the record erases each capability's failure type, which ToolsOf<Caps> restores for callers.
              decodeInput(parameters).pipe(
                Effect.orDie,
                Effect.flatMap(run),
                Effect.provideContext(context)
              )
          : (parameters) =>
              // oxlint-disable-next-line effecttsgo/any-unknown-in-error-context -- projection boundary: the record erases each capability's failure type, which ToolsOf<Caps> restores for callers.
              run(parameters).pipe(Effect.provideContext(context));
      }

      // SAFETY: the record is keyed by the capabilities' names, which is exactly `HandlersFrom<ToolsOf<Caps>>`.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- projection boundary: the record keyed by capability names is HandlersFrom<ToolsOf<Caps>>.
      return handlers as unknown as Toolkit.HandlersFrom<ToolsOf<Caps>>;
    })
  );

  return { layer, toolkit };
};
