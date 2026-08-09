import type { Session, User } from "better-auth/types";
import { getSessionToken, SESSION_COOKIE_NAME } from "./index";

/**
 * Options for {@link getSession}.
 */
export interface GetSessionOptions {
  /**
   * Base URL of the accounts identity provider. Defaults to the production
   * deployment; override in tests or for staging.
   */
  baseURL?: string;
  /**
   * Abort the upstream get-session call after this many milliseconds.
   * Defaults to 2500ms to keep edge rendering snappy.
   */
  timeoutMs?: number;
  /**
   * Fetch implementation override (mainly for tests / non-Worker runtimes).
   * Defaults to the global `fetch`.
   */
  fetchImpl?: typeof fetch;
}

export interface SessionResult {
  session: Session;
  user: User;
}

const DEFAULT_BASE_URL = "https://accounts.shikanime.studio";
const DEFAULT_TIMEOUT_MS = 2500;

/**
 * Resolve the signed-in user from the accounts IdP's cross-subdomain session
 * cookie.
 *
 * The session cookie is an opaque better-auth token, so it cannot be decoded
 * locally — we forward it to the IdP's `get-session` endpoint, which is the
 * same mechanism the better-auth client SDK uses. The consuming app reads the
 * cookie off its own `.shikanime.studio` request (the browser sends it because
 * the cookie is scoped to the parent domain) and proxies it upstream.
 *
 * Returns `null` when there is no session cookie or the IdP cannot confirm a
 * live session (expired, revoked, network error, non-2xx). Callers should
 * treat `null` as "anonymous" and never throw.
 */
export async function getSession(
  request: Request | Headers,
  options: GetSessionOptions = {},
): Promise<SessionResult | null> {
  const token = getSessionToken(request);
  if (!token) {
    return null;
  }

  const baseURL = options.baseURL ?? DEFAULT_BASE_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(`${baseURL}/api/auth/get-session`, {
      headers: {
        // Forward only the session cookie; nothing else is needed upstream.
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
      // better-auth returns 200 + the session, or 200 + null when anonymous.
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as SessionResult | null;
    return body;
  }
  catch {
    // Network failure, timeout (AbortError), or malformed response — treat as
    // no session rather than breaking the page render.
    return null;
  }
  finally {
    clearTimeout(timer);
  }
}
