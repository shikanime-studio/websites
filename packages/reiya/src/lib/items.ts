import { items } from "../schema";
import { DrizzleD1Database } from "drizzle-orm/d1";

export function getItems(
  db: DrizzleD1Database,
) {
  return db
    .select()
    .from(items);
}
