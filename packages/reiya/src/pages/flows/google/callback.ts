import {
  createAccountFromGoogleTokenInfo,
  getAccountFromGoogle,
} from "../../../lib/account";
import {
  deleteLoginFlow,
  getAuthorizationCode,
  getLoginFlow ,
  validateLoginFlow,
} from "../../../lib/google";
import { createSession } from "../../../lib/session";
import { getD1Database, getRedirectToSession } from "../../../lib/util";
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
  let tokenInfo:
    | Awaited<ReturnType<typeof validateLoginFlow>>
    | undefined;
  try {
    tokenInfo = await validateLoginFlow(flow, authCode);
  } catch (e) {
    if (e instanceof Error && e.message !== "Invalid state") {
      throw e;
    }
    return new Response("Invalid session token", { status: 401 });
  }
  const db = getD1Database(context.locals);
  const existingAccount = await getAccountFromGoogle(db, tokenInfo.sub);
  if (existingAccount) {
    await createSession(db, context, existingAccount.id);
  } else {
    const account = await createAccountFromGoogleTokenInfo(db, tokenInfo);
    await createSession(db, context, account.id);
  }
  deleteLoginFlow(context.cookies);
  return context.redirect(getRedirectToSession(context.cookies));
}
