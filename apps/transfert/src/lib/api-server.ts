import { Effect, Layer } from "effect";
import { Etag, HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";
import { HttpApiBuilder } from "effect/http-api";
import { TransfertHandlers } from "./api-handlers";
import { TransfertApi } from "./contract";

const ApiLayer = HttpApiBuilder.layer(TransfertApi).pipe(
  Layer.provide(TransfertHandlers),
  Layer.provide(Etag.layer),
);

/**
 * One web Request in, one web Response out.
 *
 * Mounted at the TanStack route /api/$, so incoming URLs carry the /api
 * prefix while the HttpApi paths (/session, /transfers/...) do not — strip
 * it by re-siting the request origin before handing it to the router.
 */
export const apiHttp = (request: Request): Promise<Response> =>
  Effect.gen(function* () {
    const handler = yield* HttpRouter.toHttpEffect(ApiLayer);
    const url = new URL(request.url);
    const sited = new Request(
      request.url.replace(`${url.origin}/api`, url.origin),
      request,
    );
    const serverRequest = HttpServerRequest.fromWeb(sited);
    return yield* handler.pipe(
      Effect.provideService(HttpServerRequest.HttpServerRequest, serverRequest),
    );
  }).pipe(
    Effect.map(HttpServerResponse.toWeb),
    Effect.scoped,
    Effect.runPromise as (eff: Effect.Effect<Response, unknown, unknown>) => Promise<Response>,
  );
