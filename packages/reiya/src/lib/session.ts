import { accountsTable, sessionsTable } from "../schema";
import type { APIContext, AstroCookies } from "astro";
import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";

export async function createSession(
  db: DrizzleD1Database,
  context: APIContext,
  accountId: number,
) {
  const [session] = await db
    .insert(sessionsTable)
    .values({
      accountId,
    })
    .returning({
      id: sessionsTable.id,
      expiresAt: sessionsTable.expiresAt,
    });
  context.cookies.set("session", session.id, {
    httpOnly: true,
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "lax",
    expires: new Date(session.expiresAt),
  });
}

export async function getSessionForHome(
  db: DrizzleD1Database,
  sessionId: string,
) {
  return db
    .select({
      id: sessionsTable.id,
      accountId: sessionsTable.accountId,
      expiresAt: sessionsTable.expiresAt,
      account: accountsTable,
    })
    .from(sessionsTable)
    .innerJoin(accountsTable, eq(sessionsTable.accountId, accountsTable.id))
    .where(eq(sessionsTable.id, sessionId))
    .get();
}

export async function validateSession(
  db: DrizzleD1Database,
  cookies: AstroCookies,
) {
  const sessionId = cookies.get("session");
  if (!sessionId) {
    throw new Error("No session");
  }
  const session = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId.value))
    .get();
  if (!session) {
    throw new Error("No session");
  }
  if (new Date() > new Date(session.expiresAt)) {
    throw new Error("Session expired");
  }
  return session;
}

export async function deleteSession(
  db: DrizzleD1Database,
  cookies: AstroCookies,
) {
  const sessionId = cookies.get("session");
  if (!sessionId) {
    throw new Error("No session");
  }
  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.id, sessionId.value))
    .run();
  cookies.delete("session");
}
