import type { APIContext } from "astro";
import { createD1Database } from "../../lib/db";
import { notifications } from "../../schema";
import { eq, desc, count, and, inArray } from "drizzle-orm";

export async function onRequestGet(context: APIContext) {
  const db = createD1Database(context.locals);
  const userId = context.locals.user?.id;

  if (!userId) {
    return Response.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(context.request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unread") === "true";

    const conditions = [eq(notifications.userId, userId)];

    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get unread count
    const unreadCountResult = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );

    const unreadCount = unreadCountResult[0]?.count || 0;

    return Response.json({
      notifications: userNotifications,
      unreadCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function onRequestPost(context: APIContext) {
  const db = createD1Database(context.locals);
  const userId = context.locals.user?.id;

  if (!userId) {
    return Response.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const body = await context.request.json() as { notificationIds: number[] };
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds)) {
      return Response.json(
        { error: "Invalid notification IDs" },
        { status: 400 },
      );
    }

    // Mark notifications as read
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          inArray(notifications.id, notificationIds),
        ),
      );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return Response.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}
