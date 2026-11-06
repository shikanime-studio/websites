import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { createD1Database } from "../../../lib/db";
import { transfers } from "../../../schema";

async function loadTransfer(id: string) {
  const db = createD1Database();
  const [row] = await db
    .select()
    .from(transfers)
    .where(eq(transfers.id, id))
    .limit(1);
  if (!row || row.expiresAt.getTime() < Date.now()) {
    return null;
  }
  return row;
}

export const Route = createFileRoute("/api/t/$id")({
  server: {
    handlers: {
      PUT: async ({ params }) => {
        const row = await loadTransfer(params.id);
        if (!row) {
          return new Response("not found", { status: 404 });
        }
        const request = getRequest();
        const blob = await request.blob();
        await env.BUCKET.put(row.id, blob, {
          httpMetadata: { contentType: "application/octet-stream" },
        });
        return new Response("stored", { status: 200 });
      },
      GET: async ({ params }) => {
        const row = await loadTransfer(params.id);
        if (!row) {
          return new Response("not found", { status: 404 });
        }
        const object = await env.BUCKET.get(row.id);
        if (!object) {
          return new Response("not found", { status: 404 });
        }
        return new Response(object.body, {
          headers: {
            "content-type":
              object.httpMetadata?.contentType ?? "application/octet-stream",
            "content-disposition": `attachment; filename="${row.filename.replaceAll('"', "")}"`,
          },
        });
      },
    },
  },
});
