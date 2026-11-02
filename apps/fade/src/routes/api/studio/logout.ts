import { createFileRoute } from "@tanstack/react-router";
import { SESSION_COOKIE } from "../../../lib/config";

export const Route = createFileRoute("/api/studio/logout")({
  server: {
    handlers: {
      POST: async () =>
        Response.json({ ok: true }, {
          headers: {
            "cache-control": "no-store",
            "set-cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
          },
        }),
    },
  },
});
