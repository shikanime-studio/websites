import {
  createAuthorizationURL,
  setLoginFlowCookies,
} from "../../../lib/google";
import { getRedirectTo, setRedirectToCookies } from "../../../lib/util";
import { generateCodeVerifier, generateState } from "arctic";
import type { APIContext } from "astro";

export function GET(context: APIContext) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = createAuthorizationURL(state, codeVerifier);
  setLoginFlowCookies(context.cookies, state, codeVerifier);
  setRedirectToCookies(context.cookies, getRedirectTo(context.url));
  return context.redirect(url.toString());
}
