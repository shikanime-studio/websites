import type { APIContext } from "astro";
import { createD1Database } from "../../lib/db";
import { licenses, characters } from "../../schema";
import { eq, like, count } from "drizzle-orm";

export async function onRequestGet(context: APIContext) {
  const db = createD1Database(context.locals);
  const { searchParams } = new URL(context.request.url);

  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const whereClause = search ? like(licenses.name, `%${search}%`) : undefined;

    const query = db
      .select({
        license: licenses,
        characterCount: count(characters.id),
      })
      .from(licenses)
      .leftJoin(characters, eq(licenses.id, characters.id))
      .groupBy(licenses.id)
      .where(whereClause);

    const licenseResults = await query.limit(limit).offset(offset);

    return Response.json({
      licenses: licenseResults.map((result) => ({
        ...result.license,
        characterCount: result.characterCount,
      })),
      totalCount: licenseResults.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return Response.json(
      { error: "Failed to fetch licenses" },
      { status: 500 },
    );
  }
}
