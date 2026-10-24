import { createFileRoute } from "@tanstack/react-router";
import { asc, eq } from "drizzle-orm";
import { createD1Database } from "../../../../lib/db";
import * as schema from "../../../../schema";

export const Route = createFileRoute("/api/share/$token/photos")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { token: string } }) => {
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
        const photos = await db
          .select({
            id: schema.commissionPhotos.id,
            contentType: schema.commissionPhotos.contentType,
            size: schema.commissionPhotos.size,
          })
          .from(schema.commissionPhotos)
          .where(eq(schema.commissionPhotos.commissionId, commission.id))
          .orderBy(asc(schema.commissionPhotos.id));
        return Response.json({ photos });
      },
    },
  },
});
