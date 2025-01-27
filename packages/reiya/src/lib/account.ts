import { DrizzleD1Database } from "drizzle-orm/d1";
import { accountsTable } from "../schema";
import { eq } from "drizzle-orm";
import type { TokenInfo } from "./google";

export async function createAccountFromGoogleTokenInfo(
  db: DrizzleD1Database,
  tokenInfo: TokenInfo,
) {
  return await db
    .insert(accountsTable)
    .values({
      googleId: tokenInfo.sub,
      email: tokenInfo.email,
      name: tokenInfo.name,
      pictureUrl: tokenInfo.picture,
    })
    .returning({
      id: accountsTable.id,
    })
    .get();
}

export function getAccountFromGoogle(db: DrizzleD1Database, googleId: string) {
  return db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.googleId, googleId))
    .get();
}

export function getAccount(db: DrizzleD1Database, accountId: number) {
  return db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.id, accountId))
    .get();
}
