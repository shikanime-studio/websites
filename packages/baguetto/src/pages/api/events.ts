import type { APIContext } from "astro";
import { createD1Database } from "../../lib/db";
import { events, eventsToMakers, makers } from "../../schema";
import { eq, like, count, gte, and } from "drizzle-orm";

export async function onRequestGet(context: APIContext) {
  const db = createD1Database(context.locals);
  const { searchParams } = new URL(context.request.url);

  const search = searchParams.get("search");
  const upcoming = searchParams.get("upcoming") === "true";
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const conditions = [];
    if (search) conditions.push(like(events.name, `%${search}%`));
    if (upcoming) conditions.push(gte(events.startsAt, new Date().toISOString()));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db
      .select({
        event: events,
        makerCount: count(makers.id),
      })
      .from(events)
      .leftJoin(eventsToMakers, eq(events.id, eventsToMakers.eventId))
      .leftJoin(makers, eq(eventsToMakers.makerId, makers.id))
      .groupBy(events.id)
      .where(whereClause);

    const eventResults = await query.limit(limit).offset(offset);

    return Response.json({
      events: eventResults.map((result) => ({
        ...result.event,
        makerCount: result.makerCount,
      })),
      totalCount: eventResults.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
