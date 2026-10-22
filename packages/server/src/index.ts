// eslint-disable-next-line effecttsgo/node-builtin-import -- createServer is only the factory passed to the Effect-native NodeHttpServer adapter; all request handling stays in Effect layers
import { createServer } from "node:http";

import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Config, Layer } from "effect";
import { HttpRouter, HttpServer } from "effect/http";

import { ApiLive, DocsLive } from "./http.ts";

const Routes = Layer.mergeAll(ApiLive, DocsLive).pipe(
  Layer.provide(HttpServer.layerServices)
);

const port = Config.Port("PORT").pipe(Config.withDefault(3000));

const ServerLive = HttpRouter.serve(Routes).pipe(
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layerConfig(createServer, { port }))
);

NodeRuntime.runMain(Layer.launch(ServerLive));
