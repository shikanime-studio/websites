import { accounts, sessions } from "../schema";
import type { AstroCookies } from "astro";
import { eq, sql, and } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";

export async function createSession(db: DrizzleD1Database, accountId: number) {
  const [session] = await db
    .insert(sessions)
    .values({
      accountId,
    })
    .returning({
      id: sessions.id,
      expiresAt: sessions.expiresAt,
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
      id: sessions.id,
      accountId: sessions.accountId,
      expiresAt: sessions.expiresAt,
      account: accounts,
    })
    .from(sessions)
    .innerJoin(accounts, eq(sessions.accountId, accounts.id))
    .where(
      and(
        eq(sessions.id, sessionId),
        sql`${sessions.expiresAt} > datetime('now')`,
      ),
    )
    .get();
}

export function deleteSession(db: DrizzleD1Database, sessionId: string) {
  return db.delete(sessions).where(eq(sessions.id, sessionId)).run();
}

export function deleteSessionCookies(cookies: AstroCookies) {
  cookies.delete("session");
}
