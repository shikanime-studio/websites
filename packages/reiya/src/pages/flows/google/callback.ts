import {
  createUserFromTokens,
  getUserFromTokens,
} from "../../../lib/users";
import {
  deleteLoginFlowCookies,
  getAuthorizationCode,
  getLoginFlow,
  validateLoginFlow,
} from "../../../lib/google";
import { createSession, setSessionCookies } from "../../../lib/sessions";
import {
  deleteRedirectToCookies,
  getD1Database,
  getRedirectToCookies,
} from "../../../lib/util";
import type { APIContext } from "astro";
import { ZodError } from "zod";

export async function GET(context: APIContext) {
  let flow: Awaited<ReturnType<typeof getLoginFlow>> | undefined;
  let authCode: Awaited<ReturnType<typeof getAuthorizationCode>> | undefined;
  try {
    flow = getLoginFlow(context.cookies);
    authCode = getAuthorizationCode(context.url);
  } catch (e) {
    if (e instanceof ZodError) {
      return new Response("Invalid session token", { status: 400 });
    }
    throw e;
  }
  let tokens: Awaited<ReturnType<typeof validateLoginFlow>> | undefined;
  try {
    tokens = await validateLoginFlow(flow, authCode);
  } catch (e) {
    if (e instanceof Error && e.message !== "Invalid state") {
      throw e;
    }
    return new Response("Invalid session token", { status: 401 });
  }
  const db = getD1Database(context.locals);
  const existingUser = await getUserFromTokens(db, tokens);
  if (existingUser) {
    const session = await createSession(db, existingUser.id);
    setSessionCookies(context.cookies, session.id, new Date(session.expiresAt));
  } else {
    const user = await createUserFromTokens(db, tokens);
    const session = await createSession(db, user.id);
    setSessionCookies(context.cookies, session.id, new Date(session.expiresAt));
  }
  deleteLoginFlowCookies(context.cookies);
  const url = getRedirectToCookies(context.cookies);
  deleteRedirectToCookies(context.cookies);
  return context.redirect(url.toString());
}
