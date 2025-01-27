import { createAuthorizationSession } from "../../../lib/google";
import type { APIContext } from "astro";
import { maybeCreateRedirectTo } from "../../../lib/session";

export async function GET(context: APIContext) {
  const url = createAuthorizationSession(context);
  maybeCreateRedirectTo(context);
  return context.redirect(url.toString());
}
