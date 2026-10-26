import type {
  Commission,
  CommissionDetail,
  CommissionList,
  Locale, NotificationList 
} from "./types";
import { Data, Effect } from "effect";
import {
  changeCommissionStatusFn,
  createCommissionFn,
  createInviteFn,
  getCommission,
  getSessionFn,
  getUserPreferences,
  joinByInviteFn,
  listCommissions,
  listNotifications,
  markNotificationReadFn,
  revokeInviteFn,
  searchCharactersFn,
  setUserPreferences,
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

export const fetchSession = fromServerFn(getSessionFn);

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
  /** Optional: without it the creator leads the shoot until an invite lands. */
  photographerEmail?: string;
  characterName: string;
  characters: Array<{ name: string; series: string }>;
  cast: Array<{ role: "photographer" | "cosplayer" | "assistant"; name: string }>;
  shootingDate?: string | undefined;
  locationName: string;
  locationQuery: string;
  locationLat?: number | undefined;
  locationLng?: number | undefined;
  timezone: string;
  invitees: Array<{ name: string; email: string }>;
}

export const createCommission = (input: CreateCommissionInput) =>
  fromServerFn(() => createCommissionFn({ data: input }));

export const searchCharacters = (query: string) =>
  fromServerFn(() => searchCharactersFn({ data: query }));

export const createInvite = (input: {
  commissionId: number;
  role: "photographer" | "cosplayer" | "assistant";
  label?: string;
  days?: number;
}) => fromServerFn(() => createInviteFn({ data: input }));

export const revokeInvite = (commissionId: number, inviteId: number) =>
  fromServerFn(() => revokeInviteFn({ data: { commissionId, inviteId } }));

export const joinByInvite = (shareToken: string, inviteToken: string) =>
  fromServerFn(() => joinByInviteFn({ data: { shareToken, inviteToken } }));

export const markNotificationRead = (id: number) =>
  fromServerFn(() => markNotificationReadFn({ data: id }));

export interface UserPreferences {
  locale: Locale | null;
}

export type UserPreferencesResponse = UserPreferences | null;

export const fetchUserPreferences: Effect.Effect<
  UserPreferencesResponse,
  ApiError
> = fromServerFn(getUserPreferences);

export const saveUserPreferences = (prefs: { locale: Locale }) =>
  fromServerFn(() => setUserPreferences({ data: { locale: prefs.locale } }));

export type { Commission };
