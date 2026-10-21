import type {
  Commission,
  CommissionDetail,
  CommissionList,
  NotificationList,
} from "./types";
import { Data, Effect } from "effect";
import {
  changeCommissionStatusFn,
  createCommissionFn,
  getCommission,
  listCommissions,
  listNotifications,
  markNotificationReadFn,
} from "./server";

export class ApiError extends Data.TaggedError("ApiError")<{
  message: string;
}> {}

/** Server function errors carry plain messages; surface them as ApiError. */
const fromServerFn = <A>(run: () => Promise<A>): Effect.Effect<A, ApiError> =>
  Effect.tryPromise({
    try: run,
    catch: (cause) =>
      new ApiError({
        message: cause instanceof Error ? cause.message : "Request failed",
      }),
  });

/** Session is resolved server-side per request; the client atom stays null. */
export const fetchSession: Effect.Effect<null, never> = Effect.succeed(null);

export const fetchNotifications: Effect.Effect<NotificationList, ApiError> =
  fromServerFn(listNotifications);

export const fetchCommissions: Effect.Effect<CommissionList, ApiError> =
  fromServerFn(listCommissions);

export const fetchCommission = (
  id: string,
): Effect.Effect<CommissionDetail, ApiError> =>
  fromServerFn(() => getCommission({ data: id }));

export const changeCommissionStatus = (id: number, status: string) =>
  fromServerFn(() => changeCommissionStatusFn({ data: { id, status } }));

/** Photo upload is multipart; server functions take JSON, so this stays a route. */
export const uploadCommissionPhoto = (id: number, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return Effect.tryPromise({
    try: (signal) =>
      fetch(`/api/commissions/${String(id)}/photos`, {
        method: "POST",
        body: form,
        signal,
      }).then((res) => {
        if (!res.ok) {
          throw new ApiError({ message: res.statusText });
        }
      }),
    catch: (cause) =>
      cause instanceof ApiError
        ? cause
        : new ApiError({ message: "Upload failed" }),
  });
};

export interface CreateCommissionInput {
  title: string;
  description: string;
  photographerEmail: string;
  characterName: string;
  shootingDate?: string | undefined;
  locationName: string;
  locationQuery: string;
}

export const createCommission = (input: CreateCommissionInput) =>
  fromServerFn(() => createCommissionFn({ data: input }));

export const markNotificationRead = (id: number) =>
  fromServerFn(() => markNotificationReadFn({ data: id }));

export type { Commission };
