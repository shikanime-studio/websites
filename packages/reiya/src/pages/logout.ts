import { deleteSession } from "../lib/session";
import { getD1Database, getRedirectTo } from "../lib/util";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const db = getD1Database(context.locals);
  await deleteSession(db, context.cookies);
  return context.redirect(getRedirectTo(context.url));
}
