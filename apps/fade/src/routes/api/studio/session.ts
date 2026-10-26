import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { SESSION_COOKIE } from "../../../lib/config";
import { readSession } from "../../../lib/studio-session";

function cookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export const Route = createFileRoute("/api/studio/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await readSession(
          env.STUDIO_SESSION_SECRET,
          cookie(request.headers.get("cookie"), SESSION_COOKIE),
        );
        return Response.json({ user }, {
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
