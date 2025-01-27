import { deleteSession, getRedirectTo } from "../lib/session";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  await deleteSession(context);
  return context.redirect(getRedirectTo(context.url));
}
