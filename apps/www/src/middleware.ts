import { getSession } from "@shikanime-studio/auth-shared";
import { defineMiddleware } from "astro:middleware";

/** Base URL of the accounts identity provider that owns the shared session. */
const ACCOUNTS_BASE_URL = "https://accounts.shikanime.studio";

/**
 * Resolve the signed-in user for every request and expose it on `locals`.
 *
 * The cross-subdomain `better-auth.session_token` cookie is scoped to
 * `.shikanime.studio`, so the browser sends it with the document request and
 * the worker forwards it to the accounts IdP. `getSession` never throws:
 * anonymous visitors, expired tokens, and upstream failures all resolve to
 * `null`, so rendering is never blocked.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = await getSession(context.request, {
    baseURL: ACCOUNTS_BASE_URL,
  });

  return next();
});
