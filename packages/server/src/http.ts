import { Api } from "@sourdough/contracts";
import { Effect, Layer } from "effect";
import { HttpApiBuilder, HttpApiScalar } from "effect/http-api";

export const SystemHandlers = HttpApiBuilder.group(Api, "system", (handlers) =>
  handlers.handle("health", () => Effect.void)
);

export const ApiLive = HttpApiBuilder.layer(Api, {
  openapiPath: "/openapi.json",
}).pipe(Layer.provide(SystemHandlers));

export const DocsLive = HttpApiScalar.layer(Api, { path: "/docs" });
