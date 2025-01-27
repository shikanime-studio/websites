import { drizzle } from "drizzle-orm/d1";
import { sessionTable } from "../schema";
import type { APIContext, AstroCookies } from "astro";
import { eq } from "drizzle-orm";
import { z } from "astro:content";

const db = drizzle(import.meta.env.DB);

export async function createSession(context: APIContext, accountId: number) {
  const session = await db
    .insert(sessionTable)
    .values({
      accountId,
    })
    .returning({
      id: sessionTable.id,
      expiresAt: sessionTable.expiresAt,
    })
    .get();
  context.cookies.set("session", session.id, {
    httpOnly: true,
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "lax",
    expires: session.expiresAt,
  });
}

export async function validateSession(cookies: AstroCookies) {
  const sessionId = cookies.get("session");
  if (!sessionId) {
    throw new Error("No session");
  }
  const session = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.id, sessionId.value))
    .get();
  if (!session) {
    throw new Error("No session");
  }
  if (session.expiresAt < new Date()) {
    throw new Error("Session expired");
  }
  return session;
}

const deleteSessionSchema = z.object({
  id: z.string(),
});

export async function deleteSession(context: APIContext) {
  const sessionId = deleteSessionSchema.parse({
    id: context.cookies.get("session"),
  });
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId.id));
  context.cookies.delete("session");
}
