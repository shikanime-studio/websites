import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";

export function createD1Database(locals: App.Locals) {
  return drizzle<typeof schema>(locals.runtime.env.DB, {
    logger: import.meta.env.DEV,
  });
}
