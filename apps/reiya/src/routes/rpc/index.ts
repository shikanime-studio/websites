import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { fromWeb, HttpServerRequest } from "effect/http/HttpServerRequest";
import { toWeb } from "effect/http/HttpServerResponse";
import { RpcSerialization, RpcServer } from "effect/rpc";
import { group } from "../../rpc/contract";
import { handlersLayer } from "../../rpc/handlers";

export const Route = createFileRoute("/rpc/")({
  server: {
    handlers: {
      POST: ({ request }) =>
        Effect.runPromise(
          Effect.gen(function* () {
            const handle = yield* RpcServer.toHttpEffect(group, {});
            return yield* handle;
          }).pipe(
            Effect.provide(handlersLayer),
            Effect.provideService(HttpServerRequest, fromWeb(request)),
            Effect.provide(RpcSerialization.layerJson),
            Effect.scoped,
            Effect.map(toWeb),
          ),
        ),
    },
  },
});
