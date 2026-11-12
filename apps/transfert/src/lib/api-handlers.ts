import type {SessionUser, TransferRow} from "./contract";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { Effect } from "effect";
import { HttpServerRequest } from "effect/http";
import { HttpApiBuilder, HttpApiError } from "effect/http-api";
import { transfers } from "../schema";
import { createAuth } from "./auth";
import {   TransfertApi } from "./contract";
import { createD1Database } from "./db";
import {
  expiryDate,
  isImagePath,
  newTransferId,
  uploadIntentSchema,
  USER_QUOTA_BYTES,
} from "./transfert";

type Headers = globalThis.Headers;

async function sessionUser(headers: Headers): Promise<SessionUser | null> {
  const request = new Request("http://local/", { headers });
  const db = createD1Database();
  const auth = createAuth(db);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return null;
  }
  return {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };
}

function requireUser(headers: Headers): Promise<SessionUser> {
  return sessionUser(headers).then((user) => {
    if (!user) {
      throw new Error("Sign in to send files.");
    }
    return user;
  });
}

const liveRows = (email: string) =>
  and(eq(transfers.userId, email), gt(transfers.expiresAt, new Date()));

const as500 = () => new HttpApiError.InternalServerError();

const requestHeaders = Effect.map(
  HttpServerRequest.HttpServerRequest,
  (request) => request.headers as unknown as Headers,
);

export const TransfertHandlers = HttpApiBuilder.group(
  TransfertApi,
  "transfert",
  (handlers) =>
    handlers
      .handle("getSession", () =>
        Effect.flatMap(requestHeaders, (headers) =>
          Effect.promise(() => sessionUser(headers))))
      .handle("createTransfer", ({ payload }) =>
        Effect.flatMap(requestHeaders, (headers) =>
          Effect.tryPromise(async () => {
            const user = await requireUser(headers);
            const parsed = uploadIntentSchema.safeParse(payload);
            if (!parsed.success) {
              throw new Error("Invalid transfer request.");
            }
            const db = createD1Database();
            // ponytail: sweep-on-write instead of a cron trigger; expired
            // rows are dead weight the quota query would count. Replace with
            // a scheduled handler if the table grows past trivial size.
            await db
              .delete(transfers)
              .where(lt(transfers.expiresAt, new Date()));
            const [used] = await db
              .select({ total: sql<number>`coalesce(sum(${transfers.size}), 0)` })
              .from(transfers)
              .where(liveRows(user.email));
            if ((used?.total ?? 0) + parsed.data.size > USER_QUOTA_BYTES) {
              throw new Error("Your quota is full. Wait for transfers to expire.");
            }
            const id = newTransferId(() =>
              crypto.getRandomValues(new Uint8Array(10))
            );
            const now = new Date();
            await db.insert(transfers).values({
              id,
              filename: parsed.data.filename,
              size: parsed.data.size,
              // ponytail: keyed by email; swap for the accounts user id when
              // cross-app identity matters.
              userId: user.email,
              createdAt: now,
              expiresAt: expiryDate(now),
            });
            return { url: `/t/${id}` };
          })).pipe(Effect.mapError(as500)))
      .handle("getTransferMeta", ({ params }) =>
        Effect.promise(async () => {
          const db = createD1Database();
          const [row] = await db
            .select({
              filename: transfers.filename,
              expiresAt: transfers.expiresAt,
            })
            .from(transfers)
            .where(eq(transfers.id, params.id))
            .limit(1);
          if (!row || row.expiresAt.getTime() < Date.now()) {
            return { image: false, live: false };
          }
          return { image: isImagePath(row.filename), live: true };
        }))
      .handle("listMyTransfers", () =>
        Effect.flatMap(requestHeaders, (headers) =>
          Effect.tryPromise(async () => {
            const user = await requireUser(headers);
            const db = createD1Database();
            const rows = await db
              .select({
                id: transfers.id,
                filename: transfers.filename,
                size: transfers.size,
                downloads: transfers.downloads,
                downloadSeen: transfers.downloadSeen,
                expiresAt: transfers.expiresAt,
              })
              .from(transfers)
              .where(liveRows(user.email));
            const mapped: Array<TransferRow> = rows.map((row) => ({
              id: row.id,
              filename: row.filename,
              size: row.size,
              downloads: row.downloads,
              unseen: row.downloads - row.downloadSeen,
              expiresAt: row.expiresAt.toISOString(),
            }));
            return mapped;
          })).pipe(Effect.mapError(as500)))
      .handle("markSeen", () =>
        Effect.flatMap(requestHeaders, (headers) =>
          Effect.tryPromise(async () => {
            const user = await requireUser(headers);
            const db = createD1Database();
            await db
              .update(transfers)
              .set({ downloadSeen: sql`${transfers.downloads}` })
              .where(eq(transfers.userId, user.email));
          })).pipe(Effect.mapError(as500))),
);

