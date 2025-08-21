import { deleteSession, deleteSessionCookies } from "../lib/sessions";
import { getD1Database, getRedirectTo } from "../lib/util";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const db = getD1Database(context.locals);
  const sessionId = context.cookies.get("session");
  if (!sessionId) {
    return context.redirect(getRedirectTo(context.url));
  }
  await deleteSession(db, sessionId.value);
  deleteSessionCookies(context.cookies);
  return context.redirect(getRedirectTo(context.url));
}
