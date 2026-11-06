import type { Effect } from "effect";
import type { ForApi } from "effect/http-api/HttpApiClient";
import type { SessionUser, TransferRow } from "./contract";
import { Context, Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/http";
import { HttpApiClient } from "effect/http-api";
import { TransfertApi } from "./contract";

export type { SessionUser, TransferRow };

type TransfertClient = ForApi<typeof TransfertApi>;

const AppClient = Context.Service<TransfertClient>("transfert/ApiClient");

const runtime = ManagedRuntime.make(
  Layer.effect(
    AppClient,
    HttpApiClient.make(TransfertApi, { baseUrl: "" }) as Effect.Effect<TransfertClient>,
  ).pipe(
    Layer.provideMerge(FetchHttpClient.layer),
  ),
);

const acquireClient = AppClient.use;

function withClient<A>(
  f: (rpc: TransfertClient) => Effect.Effect<A, unknown, never>,
): Promise<A> {
  return runtime.runPromise(acquireClient(f) as Effect.Effect<A>);
}

export const client = {
  getSession: (): Promise<SessionUser | null> =>
    withClient((rpc) => rpc.transfert.getSession()),
  createTransfer: (
    input: { filename: string, size: number },
  ): Promise<{ url: string }> =>
    withClient((rpc) => rpc.transfert.createTransfer({ payload: input })),
  getTransferMeta: (
    input: { id: string },
  ): Promise<{ image: boolean, live: boolean }> =>
    withClient((rpc) => rpc.transfert.getTransferMeta({ params: input })),
  listMyTransfers: (): Promise<Array<TransferRow>> =>
    withClient((rpc) => rpc.transfert.listMyTransfers()).then(
      (rows) => [...rows],
    ),
  markSeen: (): Promise<void> =>
    withClient((rpc) => rpc.transfert.markSeen()),
};
