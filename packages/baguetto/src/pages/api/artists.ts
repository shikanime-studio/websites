import type { APIRoute } from "astro";
import { createD1Database } from "../../lib/db";
import { makers, items } from "../../schema";
import { eq, like, count } from "drizzle-orm";

export const GET: APIRoute = async function (context) {
  const db = createD1Database(context.locals);
  const { searchParams } = new URL(context.request.url);

  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const whereClause = search ? like(makers.name, `%${search}%`) : undefined;

    const query = db
      .select({
        maker: makers,
        itemCount: count(items.id),
      })
      .from(makers)
      .leftJoin(items, eq(makers.id, items.makerId))
      .groupBy(makers.id)
      .where(whereClause);

    const artists = await query.limit(limit).offset(offset);

    return Response.json({
      artists: artists.map((artist) => ({
        ...artist.maker,
        itemCount: artist.itemCount,
      })),
      totalCount: artists.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return Response.json({ error: "Failed to fetch artists" }, { status: 500 });
  }
};
