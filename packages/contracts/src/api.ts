import { Schema } from "effect";
import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  OpenApi,
} from "effect/http-api";

export class SystemApiGroup extends HttpApiGroup.make("system", {
  topLevel: true,
}).add(
  HttpApiEndpoint.get("health", "/health", {
    success: Schema.Void,
  })
) {}

export class Api extends HttpApi.make("sourdough-api")
  .add(SystemApiGroup)
  .annotateMerge(
    OpenApi.annotations({
      title: "Sourdough API",
    })
  ) {}
