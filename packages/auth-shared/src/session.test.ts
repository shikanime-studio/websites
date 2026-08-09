import { describe, expect, it, vi } from "vitest";
import { getSession, type SessionResult } from "./session";
import { getSessionToken, SESSION_COOKIE_NAME } from "./index";

const SESSION: SessionResult = {
  session: {
    id: "sess_1",
    token: "opaque-token",
    userId: "user_1",
    expiresAt: new Date("2099-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ipAddress: null,
    userAgent: null,
  },
  user: {
    id: "user_1",
    name: "Reiya",
    email: "reiya@shikanime.studio",
    emailVerified: true,
    image: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("getSessionToken", () => {
  it("extracts the session token from a Request cookie header", () => {
    const req = new Request("https://fade.shikanime.studio/", {
      headers: { cookie: `foo=bar; ${SESSION_COOKIE_NAME}=the-token; baz=qux` },
    });
    expect(getSessionToken(req)).toBe("the-token");
  });

  it("extracts the session token from a Headers object", () => {
    const headers = new Headers({ cookie: `${SESSION_COOKIE_NAME}=enc%20token` });
    expect(getSessionToken(headers)).toBe("enc token");
  });

  it("returns null when the cookie is absent", () => {
    expect(getSessionToken(new Headers({ cookie: "foo=bar" }))).toBeNull();
    expect(getSessionToken(new Request("https://x.test/"))).toBeNull();
    expect(getSessionToken({})).toBeNull();
  });
});

describe("getSession", () => {
  it("returns the session when the IdP confirms a live session", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(SESSION));
    const req = new Request("https://fade.shikanime.studio/", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=the-token` },
    });

    const result = await getSession(req, { fetchImpl });

    expect(result?.user.id).toBe("user_1");
    expect(result?.user.email).toBe("reiya@shikanime.studio");
    expect(result?.session.userId).toBe("user_1");
    // better-auth serializes dates as ISO strings over the wire.
    expect(typeof result?.session.expiresAt).toBe("string");
    // It must forward only the session cookie upstream.
    const calledUrl = (fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    const calledInit = (fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0]![1] as RequestInit;
    expect(calledUrl).toBe("https://accounts.shikanime.studio/api/auth/get-session");
    expect(calledInit.headers).toMatchObject({
      cookie: `${SESSION_COOKIE_NAME}=the-token`,
    });
  });

  it("returns null when there is no session cookie", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(SESSION));
    const result = await getSession(new Headers(), { fetchImpl });
    expect(result).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns null when the IdP returns a non-2xx", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ message: "nope" }, 401));
    const req = new Request("https://fade.shikanime.studio/", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=bad` },
    });
    expect(await getSession(req, { fetchImpl })).toBeNull();
  });

  it("returns null when the IdP returns an empty session", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(null));
    const req = new Request("https://fade.shikanime.studio/", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=x` },
    });
    expect(await getSession(req, { fetchImpl })).toBeNull();
  });

  it("returns null on a network error instead of throwing", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    });
    const req = new Request("https://fade.shikanime.studio/", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=x` },
    });
    await expect(getSession(req, { fetchImpl })).resolves.toBeNull();
  });

  it("honors a custom baseURL", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(SESSION));
    const req = new Request("https://fade.shikanime.studio/", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=x` },
    });
    await getSession(req, { fetchImpl, baseURL: "https://accounts.staging.test" });
    const calledUrl = (fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(calledUrl).toBe("https://accounts.staging.test/api/auth/get-session");
  });
});
