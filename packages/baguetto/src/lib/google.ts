import { getGoogleConfig } from "./config";
import { Google } from "arctic";
import { decodeIdToken } from "arctic";
import type { AstroCookies } from "astro";
import z from "zod";

const googleConfig = getGoogleConfig();

export const google = new Google(
  googleConfig.clientId,
  googleConfig.clientSecret,
  `${googleConfig.authorizedRedirectBaseUri}/flows/google/callback`,
);

export function createAuthorizationURL(state: string, codeVerifier: string) {
  return google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);
}

const loginFlowSchema = z.object({
  storedState: z.string(),
  codeVerifier: z.string(),
});

export function setLoginFlowCookies(
  cookies: AstroCookies,
  state: string,
  codeVerifier: string,
) {
  cookies.set("google_oauth_state", state, {
    httpOnly: true,
    maxAge: 60 * 10,
    secure: import.meta.env.PROD,
    path: "/",
    sameSite: "lax",
  });
  cookies.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    maxAge: 60 * 10,
    secure: import.meta.env.PROD,
    path: "/",
    sameSite: "lax",
  });
}

export function getLoginFlow(cookies: AstroCookies) {
  return loginFlowSchema.parse({
    storedState: cookies.get("google_oauth_state")?.value ?? null,
    codeVerifier: cookies.get("google_code_verifier")?.value ?? null,
  });
}

const authorizationCodeSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export function getAuthorizationCode(url: URL) {
  return authorizationCodeSchema.parse({
    code: url.searchParams.get("code"),
    state: url.searchParams.get("state"),
  });
}

export async function validateLoginFlow(
  sessionFlow: z.infer<typeof loginFlowSchema>,
  authorizationCode: z.infer<typeof authorizationCodeSchema>,
) {
  if (sessionFlow.storedState !== authorizationCode.state) {
    throw new Error("Invalid state");
  }
  return google.validateAuthorizationCode(
    authorizationCode.code,
    sessionFlow.codeVerifier,
  );
}

const tokenInfoSchema = z.object({
  sub: z.string(),
  name: z.string(),
  picture: z.string(),
  email: z.string(),
});

export const getTokenInfo = (idToken: string) => {
  return tokenInfoSchema.parse(decodeIdToken(idToken));
};

export function deleteLoginFlowCookies(cookies: AstroCookies) {
  cookies.delete("google_oauth_state");
  cookies.delete("google_code_verifier");
}
