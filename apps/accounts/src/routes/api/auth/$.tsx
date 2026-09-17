import { createFileRoute } from "@tanstack/react-router";
import { createAuth } from "../../../lib/auth";
import { createD1Database } from "../../../lib/db";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const db = createD1Database();
        const auth = createAuth(db);
        return auth.handler(request);
      },
      POST: ({ request }) => {
        const db = createD1Database();
        const auth = createAuth(db);
        return auth.handler(request);
      },
    },
  },
});
