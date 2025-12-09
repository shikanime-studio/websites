import { createAuth } from "../../../lib/auth";
import type { APIRoute } from "astro";
import { createD1Database } from "../../../lib/db";

export const ALL: APIRoute = async (context) => {
  const db = createD1Database(context.locals);
  const auth = createAuth(db);
  return auth.handler(context.request);
};
