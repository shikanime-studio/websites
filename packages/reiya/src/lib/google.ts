import { Google } from "arctic";
import { generateCodeVerifier, generateState } from "arctic";
import type { APIContext } from "astro";
import z from "zod";
import { decodeIdToken } from "arctic";
import { getGoogleConfig } from "./config";

const googleConfig = getGoogleConfig();

const google = new Google(
  googleConfig.clientId,
  googleConfig.clientSecret,
  `${import.meta.env.SITE}/flows/google/callback`,
);

export class OAuth2Error extends Error {}

const authorizationFlowSchema = z.object({
  redirectTo: z.string().optional(),
});

export function createAuthorizationSession(context: APIContext) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);
  context.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    maxAge: 60 * 10,
    secure: import.meta.env.PROD,
    path: "/",
    sameSite: "lax",
  });
  context.cookies.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    maxAge: 60 * 10,
    secure: import.meta.env.PROD,
    path: "/",
    sameSite: "lax",
  });
  return url;
}

const validationFlowSchema = z
  .object({
    storedState: z.string(),
    codeVerifier: z.string(),
    code: z.string(),
    state: z.string(),
  })
  .refine((data) => data.storedState === data.state, {
    message: "Invalid state",
    path: ["state"],
  });

export async function getSessionToken(context: APIContext) {
  const result = validationFlowSchema.parse({
    storedState: context.cookies.get("google_oauth_state")?.value ?? null,
    codeVerifier: context.cookies.get("google_code_verifier")?.value ?? null,
    code: context.url.searchParams.get("code"),
    state: context.url.searchParams.get("state"),
  });

  try {
    return await google.validateAuthorizationCode(
      result.code,
      result.codeVerifier,
    );
  } catch (e) {
    throw new OAuth2Error("Could not validate authorization code");
  }
}

const sessionTokenInfoSchema = z.object({
  sub: z.string(),
  name: z.string(),
  picture: z.string(),
  email: z.string(),
});

export type SessionTokenInfo = z.infer<typeof sessionTokenInfoSchema>;

export async function getSessionTokenInfo(context: APIContext) {
  const token = await getSessionToken(context);
  const claims = decodeIdToken(token.idToken());
  return sessionTokenInfoSchema.parse(claims);
}
