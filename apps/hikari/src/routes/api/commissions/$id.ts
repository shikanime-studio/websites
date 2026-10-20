import type { CommissionStatus } from "../../../schema";
import { createFileRoute } from "@tanstack/react-router";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { createD1Database } from "../../../lib/db";
import { canTransition, isCommissionStatus } from "../../../lib/hikari";
import { getSessionUser } from "../../../lib/session";
import * as schema from "../../../schema";

const patchSchema = z.object({
  status: z.string().refine(isCommissionStatus, "Unknown commission status"),
});

async function loadCommission(id: number) {
  const db = createD1Database();
  const rows = await db
    .select()
    .from(schema.commissions)
    .where(eq(schema.commissions.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export const Route = createFileRoute("/api/commissions/$id")({
  params: {
    parse: ({ id }: Record<string, string>) => ({
      id: z.coerce.number().int().positive().parse(id),
    }),
  },
  server: {
    handlers: {
      GET: async ({
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
        const commission = await loadCommission(params.id);
        if (
          !commission ||
          (commission.photographerId !== user.id &&
            commission.clientId !== user.id)
        ) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const db = createD1Database();
        const photos = await db
          .select({
            id: schema.commissionPhotos.id,
            contentType: schema.commissionPhotos.contentType,
            size: schema.commissionPhotos.size,
            createdAt: schema.commissionPhotos.createdAt,
          })
          .from(schema.commissionPhotos)
          .where(eq(schema.commissionPhotos.commissionId, params.id))
          .orderBy(asc(schema.commissionPhotos.id));
        return Response.json({ ...commission, photos });
      },
      PATCH: async ({
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
        const commission = await loadCommission(params.id);
        if (
          !commission ||
          (commission.photographerId !== user.id &&
            commission.clientId !== user.id)
        ) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const bodyResult = patchSchema.safeParse(await request.json());
        if (!bodyResult.success) {
          return Response.json(
            { error: "Invalid request", issues: bodyResult.error.issues },
            { status: 400 },
          );
        }
        const next = bodyResult.data.status as CommissionStatus;
        if (!canTransition(commission.status, next)) {
          return Response.json(
            {
              error: `Invalid transition ${commission.status} → ${next}`,
            },
            { status: 422 },
          );
        }

        const db = createD1Database();
        const now = new Date();
        const updated = await db
          .update(schema.commissions)
          .set({ status: next, updatedAt: now })
          .where(eq(schema.commissions.id, params.id))
          .returning();

        const counterpartId =
          user.id === commission.photographerId
            ? commission.clientId
            : commission.photographerId;
        await db.insert(schema.notifications).values({
          userId: counterpartId,
          type: `commission_${next}`,
          title: "Commission update",
          message: `${commission.title} is now ${next}`,
          relatedId: commission.id,
          relatedType: "commission",
          createdAt: now,
        });

        return Response.json(updated[0]);
      },
    },
  },
});
