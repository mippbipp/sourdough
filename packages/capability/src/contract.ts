import type { Effect, Schema } from "effect";

/** Behaviour hints that MCP clients read before calling a tool. */
export interface Annotations {
  readonly destructive: boolean;
  readonly idempotent: boolean;
  readonly openWorld: boolean;
  readonly readOnly: boolean;
}

/** A schema that needs no services to decode or encode. */
export type PlainSchema = Schema.Top & {
  readonly DecodingServices: never;
  readonly EncodingServices: never;
};

export type InputSchema = Schema.Struct<Readonly<Record<string, PlainSchema>>>;

export interface Contract<
  Name extends string,
  Input extends InputSchema,
  Output extends PlainSchema,
  Failure extends PlainSchema,
> {
  readonly annotations: Annotations;
  readonly description: string;
  readonly failure: Failure;
  readonly input: Input;
  readonly name: Name;
  readonly output: Output;
}

export type AnyContract = Contract<
  string,
  InputSchema,
  PlainSchema,
  PlainSchema
>;

export interface Capability<
  ContractType extends AnyContract,
  Requirements = never,
> {
  readonly contract: ContractType;
  readonly handler: (
    input: ContractType["input"]["Type"]
  ) => Effect.Effect<
    ContractType["output"]["Type"],
    ContractType["failure"]["Type"],
    Requirements
  >;
}

export interface AnyCapability {
  readonly contract: AnyContract;
  readonly handler: (input: never) => Effect.Effect<unknown, unknown, unknown>;
}

export type InputOf<Cap extends AnyCapability> = Cap["contract"]["input"];

export type OutputOf<Cap extends AnyCapability> = Cap["contract"]["output"];

export type FailureOf<Cap extends AnyCapability> = Cap["contract"]["failure"];

export type RequirementsOf<Cap> = Cap extends {
  readonly handler: (
    input: never
  ) => Effect.Effect<unknown, unknown, infer Requirements>;
}
  ? Requirements
  : never;

export interface DefineContractOptions<
  Input extends InputSchema,
  Output extends PlainSchema,
  Failure extends PlainSchema,
> {
  readonly annotations?: Partial<Annotations> | undefined;
  readonly description: string;
  readonly failure: Failure;
  readonly input: Input;
  readonly output: Output;
}

const defaultAnnotations: Annotations = {
  destructive: false,
  idempotent: false,
  openWorld: false,
  readOnly: false,
};

export const defineContract = <
  const Name extends string,
  Input extends InputSchema,
  Output extends PlainSchema,
  Failure extends PlainSchema,
>(
  name: Name,
  options: DefineContractOptions<Input, Output, Failure>
): Contract<Name, Input, Output, Failure> => ({
  annotations: { ...defaultAnnotations, ...options.annotations },
  description: options.description,
  failure: options.failure,
  input: options.input,
  name,
  output: options.output,
});

export const implement = <
  ContractType extends AnyContract,
  Requirements = never,
>(
  contract: ContractType,
  handler: (
    input: ContractType["input"]["Type"]
  ) => Effect.Effect<
    ContractType["output"]["Type"],
    ContractType["failure"]["Type"],
    Requirements
  >
): Capability<ContractType, Requirements> => ({ contract, handler });
