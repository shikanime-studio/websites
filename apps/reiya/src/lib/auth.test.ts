import { applyD1Migrations, SELF } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { inject, it, expect, beforeAll } from "vitest";

const BASE = "https://reiya.shikanime.studio";

// Statuses that prove the callback did NOT silently mint a session. The
// genericOAuth callback rejects bad inputs with a redirect to the error page
// (302 + `?error=` query), which is the expected "302-with-error" behavior.
const REJECTED = [302, 307, 308, 400, 401, 403, 500];

beforeAll(async () => {
  await applyD1Migrations(env.DB, inject("migrations"));
});

it("rejects an OAuth callback with an invalid/expired authorization code", async () => {
  // Exercise the real Worker entry-point (src/test-worker-entry.ts) and hit
  // reiya's genericOAuth callback for the `accounts` provider with a bogus
  // code. better-auth must attempt to exchange it (and validate state) and
  // fail, so we must NOT see a 200 with a session cookie set.
  const res = await SELF.fetch(
    `${BASE}/api/auth/oauth2/callback/accounts?code=invalid-bogus-code&state=xyz`,
    // Don't follow the error redirect — we want to assert on the rejection.
    { redirect: "manual" },
  );

  // Not a successful session grant.
  expect(res.status).not.toBe(200);
  expect(REJECTED).toContain(res.status);

  const location = res.headers.get("location");
  // A 302 here is better-auth's redirect-on-error to `?error=...`; assert it is
  // an error redirect, not a success redirect that would set a session.
  if (location) {
    expect(location).toMatch(/[?&]error=/);
    expect(location).not.toMatch(/better-auth\.session_token/i);
  }

  const setCookie = res.headers.get("set-cookie");
  // No session cookie may be issued on a rejected callback.
  if (setCookie) {
    expect(setCookie).not.toMatch(/better-auth\.session_token/i);
  }
});

it("returns a null session for an unauthenticated get-session request", async () => {
  // Cheap sanity that the handler mounts and routes correctly.
  const res = await SELF.fetch(`${BASE}/api/auth/get-session`, {
    headers: { cookie: "" },
  });
  expect(res.status).toBe(200);
  const body = (await res.json()) as unknown | null;
  expect(body).toBeNull();
});
