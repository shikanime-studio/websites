import { drizzle } from "drizzle-orm/d1";
import type { Schema } from "../schema";

export function createD1Database(locals: App.Locals) {
  return drizzle<Schema>(locals.runtime.env.DB);
}
