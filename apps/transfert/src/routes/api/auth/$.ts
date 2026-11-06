import { createFileRoute } from "@tanstack/react-router";
import { createAuth } from "../../../lib/auth";
import { createD1Database } from "../../../lib/db";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => createAuth(createD1Database()).handler(request),
      POST: ({ request }) => createAuth(createD1Database()).handler(request),
    },
  },
});
