import { createAuth } from "./auth";
import { createD1Database } from "./db";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

/**
 * Resolves the signed-in user from the request cookies. Returns null when
 * unauthenticated. ponytail: memoize per request via context if the auth
 * roundtrip ever shows up in traces.
 */
export async function getSessionUser(
  request: Request,
): Promise<SessionUser | null> {
  const db = createD1Database();
  const serverAuth = createAuth(db);
  const session = await serverAuth.api.getSession({
    headers: request.headers,
    asResponse: false,
  });
  if (!session?.user) {
    return null;
  }
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };
}
