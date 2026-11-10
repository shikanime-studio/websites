import { Layer } from "effect";
import { layer as FetchHttpClientLayer } from "effect/http/FetchHttpClient";
import { Service as AtomRpcService } from "effect/reactivity/AtomRpc";

import { RpcClient, RpcSerialization } from "effect/rpc";
import { group } from "./contract";

const protocol = RpcClient.layerProtocolHttp({ url: "/rpc" }).pipe(
  Layer.provideMerge(FetchHttpClientLayer),
  Layer.provideMerge(RpcSerialization.layerJson),
);

export const Client = AtomRpcService()("reiya/Rpc", {
  group,
  protocol,
});

export const merchsAtom = Client.query("getMerchs", undefined);
export const artistsAtom = Client.query("getArtists", undefined);
export const eventsAtom = Client.query("getEvents", undefined);
export const charactersAtom = Client.query("getCharacters", undefined);
export const showcasesAtom = Client.query("getShowcases", undefined);
export const sessionAtom = Client.query("getSessionUser", undefined);
export const categoriesAtom = Client.query("getCategories", undefined);
