import {
  createAuthorizationURL,
  setLoginFlowSessionCookies,
} from "../../../lib/google";
import { getRedirectTo, setRedirectToSession } from "../../../lib/util";
import { generateCodeVerifier, generateState } from "arctic";
import type { APIContext } from "astro";

export function GET(context: APIContext) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = createAuthorizationURL(state, codeVerifier);
  setLoginFlowSessionCookies(context.cookies, state, codeVerifier);
  setRedirectToSession(context.cookies, getRedirectTo(context.url));
  return context.redirect(url.toString());
}
