import type { SessionResult } from "@shikanime-studio/auth-shared";
import { getSession } from "@shikanime-studio/auth-shared";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/** Base URL of the accounts identity provider that owns the shared session. */
const ACCOUNTS_BASE_URL = "https://accounts.shikanime.studio";

/**
 * Resolve the signed-in user from the accounts IdP.
 *
 * Runs server-side only: the cross-subdomain `better-auth.session_token`
 * cookie is scoped to `.shikanime.studio`, so the browser sends it with the
 * document request and we forward it upstream from the worker. Returns `null`
 * for anonymous visitors — never throws.
 */
export const getSessionUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionResult | null> => {
    return await getSession(getRequest(), { baseURL: ACCOUNTS_BASE_URL });
  },
);
