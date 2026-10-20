import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createD1Database } from "../../../../../lib/db";
import { getSessionUser } from "../../../../../lib/session";
import * as schema from "../../../../../schema";

export const Route = createFileRoute("/api/commissions/$id/photos/$photoId")({
  params: {
    parse: ({ id, photoId }: Record<string, string>) => ({
      id: z.coerce.number().int().positive().parse(id),
      photoId: z.coerce.number().int().positive().parse(photoId),
    }),
  },
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { id: number; photoId: number };
      }) => {
        const user = await getSessionUser(request);
        if (!user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const db = createD1Database();
        const rows = await db
          .select()
          .from(schema.commissions)
          .where(eq(schema.commissions.id, params.id))
          .limit(1);
        const commission = rows[0];
        if (
          !commission ||
          (commission.photographerId !== user.id &&
            commission.clientId !== user.id)
        ) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const photoRows = await db
          .select()
          .from(schema.commissionPhotos)
          .where(
            and(
              eq(schema.commissionPhotos.id, params.photoId),
              eq(schema.commissionPhotos.commissionId, params.id),
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
            "cache-control": "private, max-age=3600",
          },
        });
      },
    },
  },
});
