/**
 * Shared auth helpers for the shikanime.studio identity mesh.
 *
 * The accounts app is the central OAuth/OIDC identity provider. It sets a
 * cross-subdomain session cookie (see `SESSION_COOKIE_NAME`) on
 * `.shikanime.studio`, which the other apps (fade, www, links, reiya) read to
 * discover the signed-in user without a per-app session.
 *
 * This package currently exposes the cookie contract and a low-level
 * extractor. The session reader that decodes/verifies the token lives in
 * `./session` (added in a later commit).
 */

export { getSession, type GetSessionOptions, type SessionResult } from "./session";

/** Cookie name better-auth writes for the active session. */
export const SESSION_COOKIE_NAME = "better-auth.session_token";

/**
 * Read the raw session token from a request's cookies, if present.
 *
 * Returns `null` when the cookie is absent. Does NOT verify the token — use
 * the session reader for that.
 */
export function getSessionToken(
  request: Request | Headers | Record<string, string | undefined>,
): string | null {
  let cookieHeader: string | null = null;

  if (request instanceof Request) {
    cookieHeader = request.headers.get("cookie");
  }
  else if (request instanceof Headers) {
    cookieHeader = request.get("cookie");
  }
  else {
    cookieHeader = request["cookie"] ?? null;
  }

  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === SESSION_COOKIE_NAME) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}
