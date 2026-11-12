import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Config, Layer } from "effect";
import { HttpRouter, HttpServer } from "effect/http";

import { ApiLive, DocsLive } from "./http.ts";

const Routes = Layer.mergeAll(ApiLive, DocsLive).pipe(
  Layer.provide(HttpServer.layerServices)
);

const port = Config.Port("PORT").pipe(Config.withDefault(3000));

const ServerLive = HttpRouter.serve(Routes).pipe(
  Layer.provide(BunHttpServer.layerConfig({ port }))
);

BunRuntime.runMain(Layer.launch(ServerLive));
