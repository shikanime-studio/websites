import { accountsTable, sessionsTable } from "../schema";
import type { AstroCookies } from "astro";
import { eq, sql, and } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";

export async function createSession(db: DrizzleD1Database, accountId: number) {
  const [session] = await db
    .insert(sessionsTable)
    .values({
      accountId,
    })
    .returning({
      id: sessionsTable.id,
      expiresAt: sessionsTable.expiresAt,
    });
  return session;
}

export async function setSessionCookies(
  cookies: AstroCookies,
  sessionId: string,
  expiresAt: Date,
) {
  cookies.set("session", sessionId, {
    httpOnly: true,
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "lax",
    expires: expiresAt,
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
    .where(
      and(
        eq(sessionsTable.id, sessionId),
        sql`${sessionsTable.expiresAt} > datetime('now')`,
      ),
    )
    .get();
}

export function deleteSession(db: DrizzleD1Database, sessionId: string) {
  return db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId)).run();
}

export function deleteSessionCookies(cookies: AstroCookies) {
  cookies.delete("session");
}
