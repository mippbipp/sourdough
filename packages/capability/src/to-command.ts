import {
  Array as Arr,
  Console,
  Effect,
  Option,
  Predicate,
  Record,
  Schema,
  SchemaAST,
} from "effect";
import { Argument, Command, Flag } from "effect/cli";

import type {
  AnyCapability,
  FailureOf,
  InputOf,
  OutputOf,
  PlainSchema,
  RequirementsOf,
} from "./contract.ts";

export interface ToCommandOptions<Output> {
  readonly name?: string | undefined;
  readonly positional?: readonly string[] | undefined;
  readonly render?: ((output: Output) => string) | undefined;
}

type FieldKind = "boolean" | "json" | "literals" | "number" | "string";

interface FieldSpec {
  readonly description: string | undefined;
  readonly kind: FieldKind;
  readonly literals: readonly string[];
  readonly optional: boolean;
}

const JSON_FLAG = "json";

const literalOf = (ast: SchemaAST.AST): string | undefined =>
  SchemaAST.isLiteral(ast) && Predicate.isString(ast.literal)
    ? ast.literal
    : undefined;

const primitiveKind = (ast: SchemaAST.AST): FieldKind => {
  if (SchemaAST.isString(ast)) {
    return "string";
  }

  if (SchemaAST.isNumber(ast)) {
    return "number";
  }

  if (SchemaAST.isBoolean(ast)) {
    return "boolean";
  }

  return "json";
};

const describe = (field: PlainSchema): FieldSpec => {
  let { ast } = field;

  let optional =
    ast.context?.isOptional === true ||
    SchemaAST.toEncoded(ast).context?.isOptional === true;

  const description = SchemaAST.resolveDescription(ast);

  if (SchemaAST.isUnion(ast)) {
    const members = Arr.filter(
      ast.types,
      (member) => !SchemaAST.isUndefined(member)
    );

    if (members.length < ast.types.length) {
      optional = true;
    }

    const [only] = members;

    if (members.length === 1 && only !== undefined) {
      ast = only;
    } else {
      const literals = Arr.map(members, literalOf);

      return Arr.every(literals, Predicate.isString)
        ? { description, kind: "literals", literals, optional }
        : { description, kind: "json", literals: [], optional };
    }
  }

  const literal = literalOf(ast);

  if (literal !== undefined) {
    return { description, kind: "literals", literals: [literal], optional };
  }

  return { description, kind: primitiveKind(ast), literals: [], optional };
};

// SAFETY: the flag or argument string is decoded by the field's own schema. `withSchema` types its codec with the CLI environment as decoding services; a PlainSchema needs none, which `never` satisfies.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a PlainSchema needs no CLI services, which never satisfies.
const jsonCodec = (field: PlainSchema) => Schema.fromJsonString(field) as never;

const flagFor = (name: string, field: PlainSchema): Flag.Flag<unknown> => {
  const spec = describe(field);

  const builders: Record<FieldKind, () => Flag.Flag<unknown>> = {
    boolean: () => Flag.Boolean(name).pipe(Flag.withDefault(false)),
    json: () =>
      Flag.String(name).pipe(
        Flag.withSchema(jsonCodec(field)),
        Flag.withMetavar("JSON")
      ),
    literals: () => Flag.Literals(name, spec.literals),
    number: () => Flag.Finite(name),
    string: () => Flag.String(name),
  };

  const base = builders[spec.kind]();

  const described =
    spec.description === undefined
      ? base
      : base.pipe(Flag.withDescription(spec.description));

  return spec.optional && spec.kind !== "boolean"
    ? described.pipe(Flag.optional, Flag.map(Option.getOrUndefined))
    : described;
};

const argumentFor = (
  name: string,
  field: PlainSchema
): Argument.Argument<unknown> => {
  const spec = describe(field);

  const fromJson = (metavar: string) =>
    Argument.String(name).pipe(
      Argument.withSchema(jsonCodec(field)),
      Argument.withMetavar(metavar)
    );

  const builders: Record<FieldKind, () => Argument.Argument<unknown>> = {
    boolean: () => fromJson("BOOLEAN"),
    json: () => fromJson("JSON"),
    literals: () => Argument.Literals(name, spec.literals),
    number: () => Argument.Finite(name),
    string: () => Argument.String(name),
  };

  const base = builders[spec.kind]();

  const described =
    spec.description === undefined
      ? base
      : base.pipe(Argument.withDescription(spec.description));

  return spec.optional
    ? described.pipe(Argument.optional, Argument.map(Option.getOrUndefined))
    : described;
};

/**
 * Project one capability onto an `effect/cli` command. Input fields become
 * flags (or positional arguments when listed in `positional`), and the output
 * prints as encoded JSON unless `render` is given.
 */
export const toCommand = <Cap extends AnyCapability>(
  capability: Cap,
  options?: ToCommandOptions<OutputOf<Cap>["Type"]>
) => {
  const { contract } = capability;
  const positional = new Set(options?.positional);
  const render = options?.render;

  if (render !== undefined && Record.has(contract.input.fields, JSON_FLAG)) {
    throw new Error(
      "Input field `json` conflicts with the reserved `--json` flag"
    );
  }

  const config: Record<
    string,
    Argument.Argument<unknown> | Flag.Flag<unknown>
  > = {};

  for (const [name, field] of Record.toEntries(contract.input.fields)) {
    config[name] = positional.has(name)
      ? argumentFor(name, field)
      : flagFor(name, field);
  }

  if (render !== undefined) {
    config[JSON_FLAG] = Flag.Boolean(JSON_FLAG).pipe(
      Flag.withDefault(false),
      Flag.withDescription("Print machine-readable JSON")
    );
  }

  const decodeInput = Schema.decodeUnknownEffect(contract.input);

  const encodeOutput = Schema.encodeEffect(
    Schema.fromJsonString(contract.output, { space: 2 })
  );

  // SAFETY: `Cap extends AnyCapability` widens the handler's channels to `unknown`; the extractors recover the concrete ones from `Cap`.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- projection boundary erases the handler channels; the Cap extractors restore them.
  const run = capability.handler as (
    input: InputOf<Cap>["Type"]
  ) => Effect.Effect<
    OutputOf<Cap>["Type"],
    FailureOf<Cap>["Type"],
    RequirementsOf<Cap>
  >;

  return Command.make(
    options?.name ?? contract.name,
    config,
    Effect.fn(`Capability.${contract.name}`)(function* runCommand(parsed) {
      const { [JSON_FLAG]: json, ...fields } = parsed;

      const input = yield* decodeInput(
        Record.filter(fields, (value) => value !== undefined)
      );

      const output = yield* run(input);

      const text =
        render !== undefined && json !== true
          ? render(output)
          : yield* encodeOutput(output);

      yield* Console.log(text);
    })
  ).pipe(Command.withDescription(contract.description));
};
