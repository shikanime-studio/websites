import type { Schema } from "../schema";
import { drizzle } from "drizzle-orm/d1";

export function createD1Database(locals: App.Locals) {
  return drizzle<Schema>(locals.runtime.env.DB, {
    logger: locals.runtime.env.DEV,
  });
}
