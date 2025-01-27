import {
  createAccountFromGoogleTokenInfo,
  getAccountFromGoogle,
} from "../../../lib/account";
import { createSession } from "../../../lib/session";
import { getRedirectToSession } from "../../../lib/util";
import type { APIContext } from "astro";
import {
  getAuthorizationCode,
  getLoginFlowSession,
  validateLoginFlowSession,
} from "../../../lib/google";

export async function GET(context: APIContext) {
  let flow, authCode;
  try {
    flow = getLoginFlowSession(context.cookies);
    authCode = getAuthorizationCode(context.url);
  } catch (error) {
    return new Response("Invalid session token", { status: 400 });
  }
  let tokenInfo;
  try {
    tokenInfo = await validateLoginFlowSession(flow, authCode);
  } catch (error) {
    return new Response("Invalid session token", { status: 401 });
  }
  const existingAccount = await getAccountFromGoogle(tokenInfo.sub);
  if (existingAccount) {
    await createSession(context, existingAccount.id);
  } else {
    const account = await createAccountFromGoogleTokenInfo(tokenInfo);
    await createSession(context, account.id);
  }
  return context.redirect(getRedirectToSession(context.cookies));
}
