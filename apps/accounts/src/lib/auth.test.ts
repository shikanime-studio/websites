import { applyD1Migrations, SELF } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { beforeAll, expect, inject, it } from "vitest";

const BASE = "https://accounts.shikanime.studio";

beforeAll(async () => {
  await applyD1Migrations(env.DB, inject("migrations"));
});

it("returns a null session for an unauthenticated get-session request", async () => {
  // Exercise the real Worker entry-point (src/test-worker-entry.ts).
  const res = await SELF.fetch(`${BASE}/api/auth/get-session`, {
    headers: { cookie: "" },
  });
  expect(res.status).toBe(200);
  const body = (await res.json()) as unknown | null;
  expect(body).toBeNull();
});

it("rejects a cross-origin sign-out request (CSRF guard)", async () => {
  const cookie = "__Secure-better-auth.session_token=not-a-real-token.sig";
  const res = await SELF.fetch(`${BASE}/api/auth/sign-out`, {
    method: "POST",
    headers: { cookie, origin: "https://evil.example.com" },
  });
  expect([403, 401]).toContain(res.status);
});

it("migrations produced the expected better-auth tables in D1", async () => {
  const { results } = (await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('user','session','account','verification','jwks','oauth_client','oauth_access_token','oauth_refresh_token','oauth_consent')",
  ).all()) as { results: { name: string }[] };

  const names = results.map((r) => r.name).sort();
  expect(names).toEqual([
    "account",
    "jwks",
    "oauth_access_token",
    "oauth_client",
    "oauth_consent",
    "oauth_refresh_token",
    "session",
    "user",
    "verification",
  ]);
});
