import { createFileRoute } from "@tanstack/react-router";
import { apiHttp } from "../../lib/api-server";

/**
 * Effect HttpApi bridge: /api/session, /api/transfers, /api/transfers/:id/meta,
 * /api/transfers/mark-seen. Explicit /api/t/$id (file bytes) and /api/auth/$
 * (better-auth) routes take precedence over this splat.
 */
export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      POST: ({ request }) => apiHttp(request),
      GET: ({ request }) => apiHttp(request),
    },
  },
});
