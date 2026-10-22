import { layer } from "@effect/vitest";
import { Api } from "@sourdough/contracts";
import { Effect, Layer } from "effect";
import { HttpServer } from "effect/http";
import { HttpApiTest } from "effect/http-api";

import { SystemHandlers } from "../src/http.ts";

const makeClient = HttpApiTest.groups(Api, ["system"]);

layer(Layer.mergeAll(SystemHandlers, HttpServer.layerServices))(
  "system api",
  (it) => {
    it.effect("responds to the health check", () =>
      Effect.gen(function* () {
        const client = yield* makeClient;

        const response = yield* client.health();

        assert.isUndefined(response);
      })
    );
  }
);
