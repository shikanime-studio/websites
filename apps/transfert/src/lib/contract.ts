import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup  } from "effect/http-api";

export interface SessionUser {
  name: string;
  email: string;
  image: string | null;
}

export interface TransferRow {
  id: string;
  filename: string;
  size: number;
  downloads: number;
  unseen: number;
  expiresAt: string;
}

export class GetSession extends HttpApiEndpoint.get("getSession", "/session", {
  success: Schema.NullOr(
    Schema.Struct({
      name: Schema.String,
      email: Schema.String,
      image: Schema.NullOr(Schema.String),
    }),
  ),
}) {}

export class CreateTransfer extends HttpApiEndpoint.post(
  "createTransfer",
  "/transfers",
  {
    payload: Schema.Struct({
      filename: Schema.String,
      size: Schema.Number,
    }),
    success: Schema.Struct({ url: Schema.String }),
    error: HttpApiError.InternalServerError,
  },
) {}

export class GetTransferMeta extends HttpApiEndpoint.get(
  "getTransferMeta",
  "/transfers/:id/meta",
  {
    params: Schema.Struct({ id: Schema.String }),
    success: Schema.Struct({
      image: Schema.Boolean,
      live: Schema.Boolean,
    }),
  },
) {}

export class ListMyTransfers extends HttpApiEndpoint.get(
  "listMyTransfers",
  "/transfers",
  {
    error: HttpApiError.InternalServerError,
    success: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        filename: Schema.String,
        size: Schema.Number,
        downloads: Schema.Number,
        unseen: Schema.Number,
        expiresAt: Schema.String,
      }),
    ),
  },
) {}

export class MarkSeen extends HttpApiEndpoint.post(
  "markSeen",
  "/transfers/mark-seen",
  { error: HttpApiError.InternalServerError },
) {}

export class TransfertGroup extends HttpApiGroup.make("transfert").add(
  GetSession,
  CreateTransfer,
  GetTransferMeta,
  ListMyTransfers,
  MarkSeen,
) {}

export class TransfertApi extends HttpApi.make("transfert").add(
  TransfertGroup,
) {}
