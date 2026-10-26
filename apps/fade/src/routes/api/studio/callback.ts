import type {StudioUser} from "../../../lib/studio-session";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { ACCOUNTS_SITE, CALLBACK_PATH, SESSION_COOKIE, SITE } from "../../../lib/config";
import { signSession  } from "../../../lib/studio-session";

const FLOW_COOKIE = "fade_studio_flow";

interface TokenResponse {
  access_token?: string;
}

interface UserInfoResponse {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
}

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function fail(reason: string, status = 400) {
  return new Response(`Studio sign-in failed: ${reason}`, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export const Route = createFileRoute("/api/studio/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const flow = readCookie(request.headers.get("cookie"), FLOW_COOKIE);
        if (!code || !state || !flow) return fail("missing code or state");

        let verifier: string | undefined;
        try {
          const decoded = JSON.parse(
            atob(flow.replaceAll("-", "+").replaceAll("_", "/")),
          ) as { state?: string; verifier?: string };
          if (decoded.state !== state) return fail("state mismatch");
          verifier = decoded.verifier;
        } catch {
          return fail("unreadable flow cookie");
        }
        if (!verifier) return fail("missing verifier");

        const tokenResponse = await fetch(`${ACCOUNTS_SITE}/api/auth/oauth2/token`, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: `${SITE}${CALLBACK_PATH}`,
            client_id: "fade",
            client_secret: env.ACCOUNTS_CLIENT_SECRET,
            code_verifier: verifier,
          }),
        });
        if (!tokenResponse.ok) {
          return fail(`token exchange rejected (${String(tokenResponse.status)})`);
        }
        const token = (await tokenResponse.json()) as TokenResponse;
        if (!token.access_token) return fail("no access token");

        const userInfoResponse = await fetch(
          `${ACCOUNTS_SITE}/api/auth/oauth2/userinfo`,
          { headers: { authorization: `Bearer ${token.access_token}` } },
        );
        if (!userInfoResponse.ok) {
          return fail(`userinfo rejected (${String(userInfoResponse.status)})`);
        }
        const info = (await userInfoResponse.json()) as UserInfoResponse;
        if (!info.sub || !info.email) return fail("incomplete identity");

        const user: StudioUser = {
          id: info.sub,
          email: info.email,
          name: info.name ?? info.email,
          image: info.picture ?? null,
        };
        const cookie = await signSession(env.STUDIO_SESSION_SECRET, user);

        return new Response(null, {
          status: 302,
          headers: {
            location: "/",
            "set-cookie": `${SESSION_COOKIE}=${encodeURIComponent(cookie)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${
              import.meta.env.DEV ? "" : "; Secure"
            }`,
          },
        });
      },
    },
  },
});
