import process from "node:process";
import { Effect, Layer } from "effect";
import { layer as FetchHttpClientLayer } from "effect/http/FetchHttpClient";
import { RpcClient, RpcSerialization } from "effect/rpc";
import { group } from "../src/rpc/contract";

const program = Effect.gen(function* () {
  const client = yield* RpcClient.make(group);
  const categories = yield* client.getCategories();
  console.log("getCategories:", JSON.stringify(categories).slice(0, 300));
  const merchs = yield* client.getMerchs();
  console.log("getMerchs count:", merchs.length);
  const session = yield* client.getSessionUser();
  console.log("getSessionUser:", JSON.stringify(session));
});

program
  .pipe(
    Effect.provide(
      RpcClient.layerProtocolHttp({ url: "http://localhost:5199/rpc" }).pipe(
        Layer.provideMerge(FetchHttpClientLayer),
        Layer.provideMerge(RpcSerialization.layerJson),
      ),
    ),
    Effect.scoped,
    Effect.runPromise,
  )
  .then(
    () => process.exit(0),
    (err) => {
      console.error("FAILED", err);
      process.exit(1);
    },
  );
