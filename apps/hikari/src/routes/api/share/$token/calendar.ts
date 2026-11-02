import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { SITE } from "../../../../lib/config";
import { createD1Database } from "../../../../lib/db";
import { buildIcs, parseInvitees } from "../../../../lib/sharing";
import * as schema from "../../../../schema";

export const Route = createFileRoute("/api/share/$token/calendar")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { token: string } }) => {
        const db = createD1Database();
        const rows = await db
          .select()
          .from(schema.commissions)
          .where(eq(schema.commissions.shareToken, params.token))
          .limit(1);
        const commission = rows[0];
        if (!commission) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        if (!commission.shootingDate) {
          return Response.json({ error: "No date yet" }, { status: 409 });
        }
        const url = `${SITE}/s/${commission.shareToken}`;
        const ics = buildIcs(
          {
            title: commission.title,
            details: commission.description || commission.characterName,
            location: commission.locationName || commission.locationQuery,
            shootingDate: commission.shootingDate,
            timeZone: commission.timezone,
            invitees: parseInvitees(commission.invitees),
            url,
          },
          `commission-${String(commission.id)}@hikari.shikanime.studio`,
        );
        return new Response(ics, {
          headers: {
            "content-type": "text/calendar; charset=utf-8",
            "content-disposition": `attachment; filename="hikari-${commission.shareToken}.ics"`,
            "cache-control": "private, max-age=60",
          },
        });
      },
    },
  },
});
