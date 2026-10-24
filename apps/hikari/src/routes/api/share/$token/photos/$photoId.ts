import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createD1Database } from "../../../../../lib/db";
import * as schema from "../../../../../schema";

export const Route = createFileRoute("/api/share/$token/photos/$photoId")({
  params: {
    parse: ({ token, photoId }: Record<string, string>) => ({
      token: z.string().min(1).parse(token),
      photoId: z.coerce.number().int().positive().parse(photoId),
    }),
  },
  server: {
    handlers: {
      GET: async ({
        params,
      }: {
        params: { token: string; photoId: number };
      }) => {
        const db = createD1Database();
        const rows = await db
          .select({ id: schema.commissions.id })
          .from(schema.commissions)
          .where(eq(schema.commissions.shareToken, params.token))
          .limit(1);
        const commission = rows[0];
        if (!commission) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const photoRows = await db
          .select()
          .from(schema.commissionPhotos)
          .where(
            and(
              eq(schema.commissionPhotos.id, params.photoId),
              eq(schema.commissionPhotos.commissionId, commission.id),
            ),
          )
          .limit(1);
        const photo = photoRows[0];
        if (!photo) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const object = await env.PHOTOS.get(photo.objectKey);
        if (!object) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        return new Response(object.body, {
          headers: {
            "content-type": photo.contentType,
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
