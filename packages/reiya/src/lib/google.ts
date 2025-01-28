import { getGoogleConfig } from "./config";
import { Google } from "arctic";
import { decodeIdToken } from "arctic";
import type { AstroCookies } from "astro";
import z from "zod";

const googleConfig = getGoogleConfig();

export const google = new Google(
  googleConfig.clientId,
  googleConfig.clientSecret,
  `${import.meta.env.SITE}/flows/google/callback`,
);

export function createAuthorizationURL(state: string, codeVerifier: string) {
  return google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);
}

const loginFlowSessionSchema = z.object({
  storedState: z.string(),
  codeVerifier: z.string(),
});

export function setLoginFlowSession(
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

export function getLoginFlowSession(cookies: AstroCookies) {
  return loginFlowSessionSchema.parse({
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

const tokenInfoSchema = z.object({
  sub: z.string(),
  name: z.string(),
  picture: z.string(),
  email: z.string(),
});

export type TokenInfo = z.infer<typeof tokenInfoSchema>;

export async function validateLoginFlowSession(
  sessionFlow: z.infer<typeof loginFlowSessionSchema>,
  authorizationCode: z.infer<typeof authorizationCodeSchema>,
) {
  if (sessionFlow.storedState !== authorizationCode.state) {
    throw new Error("Invalid state");
  }
  const tokens = await google.validateAuthorizationCode(
    authorizationCode.code,
    sessionFlow.codeVerifier,
  );
  return tokenInfoSchema.parse(decodeIdToken(tokens.idToken()));
}

export function deleteLoginFlowSession(cookies: AstroCookies) {
  cookies.delete("google_oauth_state");
  cookies.delete("google_code_verifier");
}
