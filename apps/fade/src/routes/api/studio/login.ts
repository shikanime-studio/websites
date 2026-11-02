import { createFileRoute } from "@tanstack/react-router";
import { ACCOUNTS_SITE, CALLBACK_PATH, SITE } from "../../../lib/config";

/** One-time PKCE + state, kept in a short-lived httpOnly cookie. */
const FLOW_COOKIE = "fade_studio_flow";

const randomToken = (bytes: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (byte) =>
    byte.toString(16).padStart(2, "0")).join("");

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function challenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64url(new Uint8Array(digest));
}

export const Route = createFileRoute("/api/studio/login")({
  server: {
    handlers: {
      GET: async () => {
        const state = randomToken(16);
        const verifier = randomToken(32);
        const redirectUri = `${SITE}${CALLBACK_PATH}`;
        const url = new URL(`${ACCOUNTS_SITE}/api/auth/oauth2/authorize`);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", "fade");
        url.searchParams.set("redirect_uri", redirectUri);
        url.searchParams.set("scope", "openid profile email");
        url.searchParams.set("state", state);
        url.searchParams.set("code_challenge", await challenge(verifier));
        url.searchParams.set("code_challenge_method", "S256");

        const flow = btoa(JSON.stringify({ state, verifier }))
          .replaceAll("+", "-")
          .replaceAll("/", "_")
          .replaceAll("=", "");

        return new Response(null, {
          status: 302,
          headers: {
            location: url.toString(),
            "set-cookie": `${FLOW_COOKIE}=${flow}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${
              import.meta.env.DEV ? "" : "; Secure"
            }`,
          },
        });
      },
    },
  },
});
