import type { APIContext } from "astro";
import { createD1Database } from "../../lib/db";
import {
  usersToMakers,
  usersToCharacters,
  usersToLicenses,
} from "../../schema";
import { eq, and } from "drizzle-orm";

export async function onRequestPost(context: APIContext) {
  const db = createD1Database(context.locals);

  try {
    const body = (await context.request.json()) as {
      type: string;
      targetId: number;
    };
    const { type, targetId } = body;
    const userId = context.locals.user?.id;

    if (!userId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    if (!type || !targetId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let table: any;
    let targetField: string;

    switch (type) {
      case "artist":
        table = usersToMakers;
        targetField = "makerId";
        break;
      case "character":
        table = usersToCharacters;
        targetField = "characterId";
        break;
      case "license":
        table = usersToLicenses;
        targetField = "licenseId";
        break;
      default:
        return Response.json({ error: "Invalid follow type" }, { status: 400 });
    }

    // Check if already following
    const existing = await db
      .select()
      .from(table)
      .where(and(eq(table.userId, userId), eq(table[targetField], targetId)));

    if (existing.length > 0) {
      // Unfollow
      await db
        .delete(table)
        .where(and(eq(table.userId, userId), eq(table[targetField], targetId)));

      return Response.json({ success: true, following: false });
    } else {
      // Follow
      const followData = {
        userId,
        [targetField]: targetId,
        createdAt: new Date().toISOString(),
      };

      await db.insert(table).values(followData);

      // Queue notification (if Cloudflare Queues is configured)
      if (context.locals.runtime.env.QUEUE) {
        await context.locals.runtime.env.QUEUE.send({
          type: "new_follower",
          userId,
          targetId,
          targetType: type,
          timestamp: new Date().toISOString(),
        });
      }

      return Response.json({ success: true, following: true });
    }
  } catch (error) {
    console.error("Error processing follow request:", error);
    return Response.json(
      { error: "Failed to process follow request" },
      { status: 500 },
    );
  }
}
