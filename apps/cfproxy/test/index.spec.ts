import {
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { env, exports } from "cloudflare:workers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index.ts";

describe("tailnet proxy worker", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn(async () => {
      return new Response("upstream ok", {
        status: 200,
        headers: {
          "content-security-policy": "default-src 'none'",
          "x-upstream": "1",
        },
      });
    });
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards request to TARGET_HOST and strips CSP headers (unit style)", async () => {
    const request = new Request("http://example.com/some/path?x=1", {
      headers: {
        "cf-connecting-ip": "203.0.113.10",
        "x-client": "test",
      },
      method: "GET",
    });
    // Create an empty context to pass to `worker.fetch()`.
    const ctx = createExecutionContext();
    const response = await worker.fetch(
      request,
      { ...env, TARGET_HOST: "copyparty.taila659a.ts.net" },
      ctx,
    );
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    await waitOnExecutionContext(ctx);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const proxyRequest = fetchSpy.mock.calls[0]?.[0] as Request;
    expect(proxyRequest.url).toBe(
      "https://copyparty.taila659a.ts.net/some/path?x=1",
    );
    expect(proxyRequest.headers.get("host")).toBe("copyparty.taila659a.ts.net");
    expect(proxyRequest.headers.get("x-forwarded-for")).toContain(
      "203.0.113.10",
    );
    expect(proxyRequest.headers.get("x-client")).toBe("test");

    expect(response.headers.get("content-security-policy")).toBeNull();
    expect(response.headers.get("x-upstream")).toBe("1");
    expect(await response.text()).toMatchInlineSnapshot(`"upstream ok"`);
  });

  it("proxies via exports.default.fetch (integration style)", async () => {
    const response = await exports.default.fetch("https://example.com");
    expect(await response.text()).toMatchInlineSnapshot(`"upstream ok"`);
  });
});
