import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createD1Database } from "../../../../lib/db";
import { getSessionUser } from "../../../../lib/session";
import * as schema from "../../../../schema";

export const Route = createFileRoute("/api/notifications/$id/read")({
  params: {
    parse: ({ id }: Record<string, string>) => ({
      id: z.coerce.number().int().positive().parse(id),
    }),
  },
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
        await db
          .update(schema.notifications)
          .set({ isRead: true })
          .where(
            and(
              eq(schema.notifications.id, params.id),
              eq(schema.notifications.userId, user.id),
            ),
          );
        return Response.json({ ok: true });
      },
    },
  },
});
