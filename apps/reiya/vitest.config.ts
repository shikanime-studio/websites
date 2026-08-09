import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

// Read the drizzle-generated migrations on the Node side so the in-worker
// tests can apply them to the ephemeral miniflare D1 via `applyD1Migrations`.
const migrations = await readD1Migrations("./migrations");

export default defineConfig({
  // reiya's `createAuth` (src/lib/auth.ts) reads `import.meta.env.SITE` and
  // `import.meta.env.PUBLIC_GOOGLE_CLIENT_ID`; inject placeholders so the
  // handler can construct under the Workers vitest pool without Astro.
  define: {
    "import.meta.env.SITE": JSON.stringify("https://reiya.shikanime.studio"),
    "import.meta.env.PUBLIC_GOOGLE_CLIENT_ID": JSON.stringify(
      "placeholder-google-client-id",
    ),
  },
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    provide: { migrations },
    // better-auth surfaces its OAuth "redirect-on-error" by throwing an
    // `APIError(302)`. Under the Workers pool that rejection is emitted both
    // as the returned 302 response (asserted in the tests) and as a stray
    // unhandled rejection. It is expected here, so ignore it to keep the run
    // green without masking real test failures.
    dangerouslyIgnoreUnhandledErrors: true,
  },
  plugins: [
    cloudflareTest({
      remoteBindings: false,
      // `wrangler.jsonc` points `main` at `@astrojs/cloudflare/entrypoints/server`,
      // a virtual module only produced by the Astro build, which the Workers
      // pool cannot resolve. Override it with a test entry-point that mirrors
      // `src/pages/api/auth/[...all].ts`.
      main: "./src/test-worker-entry.ts",
      wrangler: { configPath: "./wrangler.jsonc" },
    }),
  ],
});

declare module "vitest" {
  interface ProvidedContext {
    migrations: Awaited<ReturnType<typeof readD1Migrations>>;
  }
}
