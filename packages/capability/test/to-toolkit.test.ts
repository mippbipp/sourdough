import { describe, it } from "@effect/vitest";
import { Array as Arr, Context, Effect, Layer, Option, Order } from "effect";
import { McpServer, Tool } from "effect/ai";

import { toToolkit } from "../src/index.ts";
import { Greeter, echo, greet, noArgs } from "./fixtures.ts";
import { makeMcpClient, serverLayer } from "./mcp-harness.ts";

const projection = toToolkit([echo, greet, noArgs]);

const appLayer = McpServer.toolkit(projection.toolkit).pipe(
  Layer.provideMerge(projection.layer),
  Layer.provide(Greeter.layer),
  Layer.provide(serverLayer)
);

describe("toToolkit projection", () => {
  it.effect("carries contract annotations onto each tool", () =>
    Effect.sync(() => {
      const { tools } = projection.toolkit;

      assert.strictEqual(
        tools.echo.description,
        "Repeat text a number of times"
      );
      assert.isTrue(Context.get(tools.echo.annotations, Tool.Readonly));
      assert.isTrue(Context.get(tools.echo.annotations, Tool.Idempotent));
      assert.isFalse(Context.get(tools.greet.annotations, Tool.Readonly));
    })
  );

  it.effect("lists every capability as an MCP tool", () =>
    Effect.gen(function* () {
      const client = yield* makeMcpClient(appLayer);
      const { tools } = yield* client["tools/list"]({});

      const names = Arr.map(tools, (tool) => tool.name);

      assert.deepStrictEqual(Arr.sort(names, Order.String), [
        "echo",
        "greet",
        "noArgs",
      ]);

      const echoTool = Option.getOrThrow(
        Arr.findFirst(tools, (tool) => tool.name === "echo")
      );

      assert.strictEqual(echoTool.annotations?.readOnlyHint, true);
      assert.deepInclude(echoTool.inputSchema, { required: ["text"] });
    })
  );

  it.effect("calls a capability through its requirements", () =>
    Effect.gen(function* () {
      const client = yield* makeMcpClient(appLayer);

      const result = yield* client["tools/call"]({
        arguments: { name: "rat" },
        name: "greet",
      });

      assert.notStrictEqual(result.isError, true);
      assert.deepStrictEqual(result.structuredContent, {
        greeting: "hello rat",
      });
    })
  );

  it.effect("calls a capability with no input fields", () =>
    Effect.gen(function* () {
      const client = yield* makeMcpClient(appLayer);

      const result = yield* client["tools/call"]({
        arguments: {},
        name: "noArgs",
      });

      assert.notStrictEqual(result.isError, true);
    })
  );

  it.effect("returns a declared failure as a tool error", () =>
    Effect.gen(function* () {
      const client = yield* makeMcpClient(appLayer);

      const result = yield* client["tools/call"]({
        arguments: { name: "nobody" },
        name: "greet",
      });

      assert.strictEqual(result.isError, true);
    })
  );
});
