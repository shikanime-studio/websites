import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

// Read the drizzle-generated migrations on the Node side so the in-worker
// tests can apply them to the ephemeral miniflare D1 via `applyD1Migrations`.
const migrations = await readD1Migrations("./migrations");

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    provide: { migrations },
  },
  plugins: [
    cloudflareTest({
      remoteBindings: false,
      // `wrangler.jsonc` points `main` at `@tanstack/react-start/server-entry`,
      // a virtual module only produced by the Start Vite build, which the
      // Workers pool cannot resolve. Override it with a test entry-point that
      // mirrors `src/routes/api/auth/$.ts`.
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
