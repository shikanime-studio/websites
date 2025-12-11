import type { APIContext } from "astro";
import { createD1Database } from "../../lib/db";
import { characters, licenses } from "../../schema";
import { eq, like, and } from "drizzle-orm";

export async function onRequestGet(context: APIContext) {
  const db = createD1Database(context.locals);
  const { searchParams } = new URL(context.request.url);

  const search = searchParams.get("search");
  const licenseId = searchParams.get("licenseId");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const conditions = [];
    if (search) conditions.push(like(characters.name, `%${search}%`));
    if (licenseId) conditions.push(eq(licenses.id, parseInt(licenseId)));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db
      .select({
        character: characters,
        license: licenses,
      })
      .from(characters)
      .leftJoin(licenses, eq(characters.id, licenses.id))
      .where(whereClause);

    const characterResults = await query.limit(limit).offset(offset);

    return Response.json({
      characters: characterResults.map((result) => ({
        ...result.character,
        license: result.license,
      })),
      totalCount: characterResults.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching characters:", error);
    return Response.json(
      { error: "Failed to fetch characters" },
      { status: 500 },
    );
  }
}
