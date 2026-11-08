import { toCommand, toToolkit } from "@sourdough/capability";
import { Array as Arr, Layer, Logger } from "effect";
import { McpProtocol, McpServer } from "effect/ai";
import { Command } from "effect/cli";

import { capabilities } from "./capabilities.ts";

const VERSION = "0.0.0";

const tools = toToolkit(capabilities);

// stdout carries MCP protocol frames, so logs go to stderr
export const McpStdioLive = McpServer.toolkit(tools.toolkit).pipe(
  Layer.provideMerge(tools.layer),
  Layer.provide(
    McpServer.layerStdio({
      name: "sourdough",
      protocols: [
        McpProtocol.v2025_06_18,
        McpProtocol.v2025_03_26,
        McpProtocol.v2024_11_05,
      ],
      version: VERSION,
    })
  ),
  Layer.provide(Layer.succeed(Logger.LogToStderr, true))
);

const mcpCommand = Command.make("mcp", {}, () =>
  Layer.launch(McpStdioLive)
).pipe(
  Command.withDescription("Serve every capability as an MCP tool over stdio")
);

export const cli = Command.make("sourdough").pipe(
  Command.withDescription("Run sourdough capabilities from the command line"),
  Command.withSubcommands([
    ...Arr.map(capabilities, (capability) => toCommand(capability)),
    mcpCommand,
  ])
);

export const runCli = Command.runWith(cli, { version: VERSION });
