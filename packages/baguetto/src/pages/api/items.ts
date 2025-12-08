import type { APIRoute } from "astro";
import { createD1Database } from "../../lib/db";
import { items, makers, itemsToLicenses, licenses } from "../../schema";
import { eq, and, or, like } from "drizzle-orm";

export const GET: APIRoute = async function (context) {
  const db = createD1Database(context.locals);
  const { searchParams } = new URL(context.request.url);

  const characterId = searchParams.get("characterId");
  const licenseId = searchParams.get("licenseId");
  const artistId = searchParams.get("artistId");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const conditions = [];

    if (characterId) {
      // This would need a join through itemsToLicenses -> licenses -> characters
      // For now, we'll implement the basic filtering
    }

    if (licenseId) {
      conditions.push(eq(itemsToLicenses.licenseId, parseInt(licenseId)));
    }

    if (artistId) {
      conditions.push(eq(items.makerId, parseInt(artistId)));
    }

    if (category) {
      conditions.push(eq(items.category, category));
    }

    if (search) {
      conditions.push(
        or(
          like(items.name, `%${search}%`),
          like(items.description, `%${search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db
      .select({
        item: items,
        maker: makers,
        licenses: licenses,
      })
      .from(items)
      .leftJoin(makers, eq(items.makerId, makers.id))
      .leftJoin(itemsToLicenses, eq(items.id, itemsToLicenses.itemId))
      .leftJoin(licenses, eq(itemsToLicenses.licenseId, licenses.id))
      .where(whereClause);

    const results = await query.limit(limit).offset(offset);

    // Group results by item to handle multiple licenses
    const itemMap = new Map();
    results.forEach((result) => {
      const itemId = result.item.id;
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          ...result.item,
          maker: result.maker,
          licenses: [],
        });
      }
      if (result.licenses) {
        itemMap.get(itemId).licenses.push(result.licenses);
      }
    });

    const itemsWithRelations = Array.from(itemMap.values());

    return Response.json({
      items: itemsWithRelations,
      totalCount: itemsWithRelations.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return Response.json({ error: "Failed to fetch items" }, { status: 500 });
  }
};
