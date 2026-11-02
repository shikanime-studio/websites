import { Effect } from "effect";
import { make } from "effect/reactivity/Atom";
import { authClient } from "./auth-client";
import { listAuthorizedClients } from "./oauth-clients";

export interface SessionUser {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
}

export interface SessionData {
  user?: SessionUser;
  session?: { id?: string };
}

/** The auth client resolves cookies in the browser; SSR renders the empty state. */
export const sessionAtom = make(
  Effect.tryPromise({
    try: async (): Promise<SessionData | null> => {
      const { data, error } = await authClient.getSession();
      return error ? null : (data ?? null);
    },
    catch: () => null,
  }),
);

export interface ActiveSession {
  id: string;
  userAgent?: string | null | undefined;
  ipAddress?: string | null | undefined;
  createdAt: Date;
}

export const sessionsAtom = make(
  Effect.tryPromise({
    try: async (): Promise<ActiveSession[]> => {
      const { data } = await authClient.listSessions();
      return (data ?? []) as ActiveSession[];
    },
    catch: () => [] as ActiveSession[],
  }),
);

export interface LinkedAccount {
  id: string;
  providerId: string;
}

export const accountsAtom = make(
  Effect.tryPromise({
    try: async (): Promise<LinkedAccount[]> => {
      const { data } = await authClient.listAccounts();
      return (data ?? []) as LinkedAccount[];
    },
    catch: () => [] as LinkedAccount[],
  }),
);

export const authorizedClientsAtom = make(
  Effect.tryPromise({
    try: () => listAuthorizedClients(),
    catch: () => [],
  }),
);
