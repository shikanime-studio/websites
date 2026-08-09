/**
 * Test-only Worker entry-point.
 *
 * The production `main` in `wrangler.jsonc` is
 * `@tanstack/react-start/server-entry`, a virtual module that only exists
 * during a TanStack Start Vite build, so the Workers vitest pool cannot
 * resolve it. This entry-point is wired up as `main` in `vitest.config.ts`
 * instead. It is a faithful mirror of `src/routes/api/auth/$.ts`: same
 * `createD1Database()` -> `createAuth()` -> `auth.handler(request)` pipeline,
 * so integration tests exercise the real handler over a real `fetch()`.
 */
import { createAuth } from "./lib/auth";
import { createD1Database } from "./lib/db";

export default {
  fetch(request) {
    const db = createD1Database();
    const auth = createAuth(db);
    return auth.handler(request);
  },
} satisfies ExportedHandler<Cloudflare.Env>;
