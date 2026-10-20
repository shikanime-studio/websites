import { createFileRoute } from "@tanstack/react-router";
import { desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { createD1Database } from "../../lib/db";
import { getSessionUser } from "../../lib/session";
import * as schema from "../../schema";

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  photographerEmail: z.string().trim().toLowerCase().email(),
  characterName: z.string().trim().max(120).default(""),
  shootingDate: z
    .string()
    .trim()
    .regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/,
      "Expected YYYY-MM-DD or YYYY-MM-DDTHH:mm",
    )
    .optional(),
  locationName: z.string().trim().max(200).default(""),
  locationQuery: z.string().trim().max(300).default(""),
});

export const Route = createFileRoute("/api/commissions")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const user = await getSessionUser(request);
        if (!user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const db = createD1Database();
        const rows = await db
          .select()
          .from(schema.commissions)
          .where(
            or(
              eq(schema.commissions.photographerId, user.id),
              eq(schema.commissions.clientId, user.id),
            ),
          )
          .orderBy(desc(schema.commissions.updatedAt));
        return Response.json(rows);
      },
      POST: async ({ request }: { request: Request }) => {
        const user = await getSessionUser(request);
        if (!user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const bodyResult = createSchema.safeParse(await request.json());
        if (!bodyResult.success) {
          return Response.json(
            { error: "Invalid request", issues: bodyResult.error.issues },
            { status: 400 },
          );
        }
        const input = bodyResult.data;

        const db = createD1Database();
        const photographer = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.email, input.photographerEmail))
          .limit(1);
        const photographerRow = photographer[0];
        if (!photographerRow) {
          return Response.json(
            { error: "No account found for this photographer email" },
            { status: 404 },
          );
        }

        const now = new Date();
        const inserted = await db
          .insert(schema.commissions)
          .values({
            title: input.title,
            description: input.description,
            status: "requested",
            photographerId: photographerRow.id,
            clientId: user.id,
            characterName: input.characterName,
            shootingDate: input.shootingDate ?? null,
            locationName: input.locationName,
            locationQuery: input.locationQuery,
            createdAt: now,
            updatedAt: now,
          })
          .returning();
        const commission = inserted[0];
        if (!commission) {
          return Response.json(
            { error: "Failed to create commission" },
            { status: 500 },
          );
        }

        await db.insert(schema.notifications).values({
          userId: photographerRow.id,
          type: "commission_requested",
          title: "New commission request",
          message: `${user.name} requested: ${input.title}`,
          relatedId: commission.id,
          relatedType: "commission",
          createdAt: now,
        });

        return Response.json(commission, { status: 201 });
      },
    },
  },
});
