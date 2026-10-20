import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { createD1Database } from "../../lib/db";
import { getSessionUser } from "../../lib/session";
import * as schema from "../../schema";

export const Route = createFileRoute("/api/notifications")({
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
          .from(schema.notifications)
          .where(eq(schema.notifications.userId, user.id))
          .orderBy(desc(schema.notifications.id))
          .limit(20);
        return Response.json(rows);
      },
    },
  },
});
