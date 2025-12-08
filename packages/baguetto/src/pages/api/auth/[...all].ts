import { createAuth } from "../../../lib/auth";
import type { APIRoute } from "astro";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../schema";

export const ALL: APIRoute = async (context) => {
  const db = drizzle(context.locals.runtime.env.DB, { schema });
  const auth = createAuth(db);
  return auth.handler(context.request);
};
