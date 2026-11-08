import { Effect, Layer, Logger, References } from "effect";
import { McpProtocol, McpSchema, McpServer } from "effect/ai";
import { constVoid } from "effect/Function";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpRouter,
} from "effect/http";
import { RpcClient, RpcSerialization } from "effect/rpc";

const MCP_ENDPOINT = "http://localhost/mcp";

const PROTOCOL_VERSION = "2025-06-18";

const silentLoggers = new Set([Logger.make(constVoid)]);

export const serverLayer = McpServer.layerHttp({
  name: "TestServer",
  path: "/mcp",
  protocols: [McpProtocol.v2025_06_18],
  version: "0.0.0",
}).pipe(
  Layer.provideMerge(Layer.succeed(References.CurrentLoggers, silentLoggers))
);

/** Serve `appLayer` in-process and return an initialized MCP client for it. */
export const makeMcpClient = Effect.fnUntraced(function* <A, E>(
  appLayer: Layer.Layer<A, E, HttpRouter.HttpRouter>
) {
  const { dispose, handler } = HttpRouter.toWebHandler(appLayer, {
    disableLogger: true,
  });

  yield* Effect.addFinalizer(() => Effect.promise(dispose));

  let sessionId: string | null = null;

  const fetchImpl = (
    input: Parameters<typeof globalThis.fetch>[0],
    init?: RequestInit
  ): Promise<Response> => {
    const request = input instanceof Request ? input : new Request(input, init);

    if (sessionId !== null) {
      request.headers.set("Mcp-Session-Id", sessionId);
    }

    if (!request.headers.has("Mcp-Protocol-Version")) {
      request.headers.set("Mcp-Protocol-Version", PROTOCOL_VERSION);
    }

    return handler(request).then((response) => {
      sessionId = response.headers.get("Mcp-Session-Id") ?? sessionId;

      return response;
    });
  };

  const fetch: typeof globalThis.fetch = Object.assign(fetchImpl, {
    preconnect: constVoid,
  });

  const clientLayer = RpcClient.layerProtocolHttp({
    transformClient: HttpClient.mapRequest(
      HttpClientRequest.setHeader(
        "accept",
        "application/json, text/event-stream"
      )
    ),
    url: MCP_ENDPOINT,
  }).pipe(
    Layer.provideMerge([
      FetchHttpClient.layer,
      RpcSerialization.layerJsonRpc(),
    ]),
    Layer.provide(Layer.succeed(FetchHttpClient.Fetch, fetch))
  );

  const client = yield* RpcClient.make(McpSchema.ClientRpcs).pipe(
    Effect.provide(clientLayer)
  );

  yield* client.initialize({
    capabilities: {},
    clientInfo: { name: "TestClient", version: "0.0.0" },
    protocolVersion: PROTOCOL_VERSION,
  });

  return client;
});
