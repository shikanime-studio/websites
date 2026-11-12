import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { eq, sql } from "drizzle-orm";
import { createAuth } from "../../../lib/auth";
import { createD1Database } from "../../../lib/db";
import { contentTypeFor, isImagePath } from "../../../lib/transfert";
import { transfers } from "../../../schema";

/** File-body store endpoint. Metadata rides the RPC; bytes ride this route. */
export const Route = createFileRoute("/api/t/$id")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const db = createD1Database();
        const auth = createAuth(db);
        const session = await auth.api.getSession({
          headers: request.headers,
        });
        if (!session?.user) {
          return new Response("unauthorized", { status: 401 });
        }
        const [row] = await db
          .select()
          .from(transfers)
          .where(eq(transfers.id, params.id))
          .limit(1);
        if (!row || row.expiresAt.getTime() < Date.now()) {
          return new Response("not found", { status: 404 });
        }
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) {
          return new Response("missing file", { status: 400 });
        }
        await env.BUCKET.put(row.id, file, {
          httpMetadata: { contentType: contentTypeFor(row.filename) },
        });
        return new Response("stored", { status: 200 });
      },
      GET: async ({ params }) => {
        const db = createD1Database();
        const [row] = await db
          .select()
          .from(transfers)
          .where(eq(transfers.id, params.id))
          .limit(1);
        if (!row || row.expiresAt.getTime() < Date.now()) {
          return new Response("not found", { status: 404 });
        }
        const object = await env.BUCKET.get(row.id);
        if (!object) {
          return new Response("not found", { status: 404 });
        }
        await db
          .update(transfers)
          .set({ downloads: sql`${transfers.downloads} + 1` })
          .where(eq(transfers.id, row.id));
        const inline = isImagePath(row.filename);
        return new Response(object.body, {
          headers: {
            "content-type": contentTypeFor(row.filename),
            "content-disposition": `${inline ? "inline" : "attachment"}; filename="${row.filename.replaceAll('"', "")}"`,
          },
        });
      },
    },
  },
});
