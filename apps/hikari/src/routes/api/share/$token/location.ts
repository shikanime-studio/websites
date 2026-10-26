import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createD1Database } from "../../../../lib/db";
import { getSessionUser } from "../../../../lib/session";
import * as schema from "../../../../schema";

const locationSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  accuracy: z.number().finite().min(0).max(100_000).optional(),
});

export const Route = createFileRoute("/api/share/$token/location")({
  server: {
    handlers: {
      /** Upsert the caller's latest position for this shoot. */
      POST: async ({ request, params }) => {
        const user = await getSessionUser(request);
        if (!user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const db = createD1Database();
        const commission = (
          await db
            .select({ id: schema.commissions.id })
            .from(schema.commissions)
            .where(eq(schema.commissions.shareToken, params.token))
            .limit(1)
        )[0];
        if (!commission) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const attendee = (
          await db
            .select({ id: schema.commissionAttendees.id })
            .from(schema.commissionAttendees)
            .where(
              and(
                eq(
                  schema.commissionAttendees.commissionId,
                  commission.id,
                ),
                eq(schema.commissionAttendees.userId, user.id),
              ),
            )
            .limit(1)
        )[0];
        if (!attendee) {
          return Response.json({ error: "Not attending" }, { status: 403 });
        }
        let input: z.infer<typeof locationSchema>;
        try {
          input = locationSchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid body" }, { status: 400 });
        }
        await db
          .insert(schema.commissionLocations)
          .values({
            commissionId: commission.id,
            userId: user.id,
            lat: input.lat,
            lng: input.lng,
            accuracy: input.accuracy ?? null,
            createdAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              schema.commissionLocations.commissionId,
              schema.commissionLocations.userId,
            ],
            set: {
              lat: input.lat,
              lng: input.lng,
              accuracy: input.accuracy ?? null,
              createdAt: new Date(),
            },
          });
        return Response.json({ ok: true });
      },
      /** Stop sharing: remove the caller's position entirely. */
      DELETE: async ({ request, params }) => {
        const user = await getSessionUser(request);
        if (!user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const db = createD1Database();
        const commission = (
          await db
            .select({ id: schema.commissions.id })
            .from(schema.commissions)
            .where(eq(schema.commissions.shareToken, params.token))
            .limit(1)
        )[0];
        if (!commission) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        await db
          .delete(schema.commissionLocations)
          .where(
            and(
              eq(schema.commissionLocations.commissionId, commission.id),
              eq(schema.commissionLocations.userId, user.id),
            ),
          );
        return Response.json({ ok: true });
      },
      /** Latest position per sharing attendee; public with the token. */
      GET: async ({ params }) => {
        void env;
        const db = createD1Database();
        const commission = (
          await db
            .select({ id: schema.commissions.id })
            .from(schema.commissions)
            .where(eq(schema.commissions.shareToken, params.token))
            .limit(1)
        )[0];
        if (!commission) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const rows = await db
          .select({
            name: schema.users.name,
            lat: schema.commissionLocations.lat,
            lng: schema.commissionLocations.lng,
            accuracy: schema.commissionLocations.accuracy,
            updatedAt: schema.commissionLocations.createdAt,
          })
          .from(schema.commissionLocations)
          .innerJoin(
            schema.users,
            eq(schema.users.id, schema.commissionLocations.userId),
          )
          .where(eq(schema.commissionLocations.commissionId, commission.id));
        return Response.json(
          {
            locations: rows.map((row) => ({
              ...row,
              updatedAt: row.updatedAt.toISOString(),
            })),
          },
          { headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
