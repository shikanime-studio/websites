import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createD1Database } from "../../../../lib/db";
import {
  isAllowedImageType,
  MAX_PHOTO_BYTES,
  photoObjectKey,
} from "../../../../lib/hikari";
import { getSessionUser } from "../../../../lib/session";
import * as schema from "../../../../schema";

export const Route = createFileRoute("/api/commissions/$id/photos")({
  server: {
    handlers: {
      POST: async ({
        request,
        params,
      }: {
        request: Request;
        params: { id: number };
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
        if (!commission || commission.photographerId !== user.id) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) {
          return Response.json({ error: "Missing file" }, { status: 400 });
        }
        const parseResult = z
          .object({
            type: z.string(),
            size: z.number(),
          })
          .refine((v) => isAllowedImageType(v.type), "Unsupported image type")
          .refine((v) => v.size <= MAX_PHOTO_BYTES, "Photo exceeds 25 MiB")
          .safeParse({ type: file.type, size: file.size });
        if (!parseResult.success) {
          return Response.json(
            { error: parseResult.error.issues[0]?.message ?? "Invalid file" },
            { status: 400 },
          );
        }

        const now = new Date();
        const inserted = await db
          .insert(schema.commissionPhotos)
          .values({
            commissionId: commission.id,
            objectKey: "pending",
            contentType: file.type,
            size: file.size,
            uploadedBy: user.id,
            createdAt: now,
          })
          .returning();
        const photoRow = inserted[0];
        if (!photoRow) {
          return Response.json(
            { error: "Failed to record photo" },
            { status: 500 },
          );
        }

        const objectKey = photoObjectKey(commission.id, photoRow.id, file.type);
        await env.PHOTOS.put(objectKey, file.stream(), {
          httpMetadata: { contentType: file.type },
        });
        await db
          .update(schema.commissionPhotos)
          .set({ objectKey })
          .where(eq(schema.commissionPhotos.id, photoRow.id));

        const deliveryReady =
          commission.status === "completed" && !commission.deliveryReadyAt;
        if (deliveryReady) {
          await db
            .update(schema.commissions)
            .set({ deliveryReadyAt: now, updatedAt: now })
            .where(eq(schema.commissions.id, commission.id));
        }
        await db.insert(schema.notifications).values({
          userId: commission.clientId,
          type: deliveryReady ? "photos_ready" : "photos_added",
          title: deliveryReady ? "Photos ready" : "New photos",
          message: deliveryReady
            ? `${commission.title}: your photos are ready to download`
            : `${commission.title}: new photos were added`,
          relatedId: commission.id,
          relatedType: "commission",
          createdAt: now,
        });

        return Response.json(
          {
            id: photoRow.id,
            objectKey,
            contentType: file.type,
            size: file.size,
          },
          { status: 201 },
        );
      },
    },
  },
});
