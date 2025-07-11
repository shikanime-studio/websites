import { accounts } from "../schema";
import type { TokenInfo } from "./google";
import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";

export async function createAccountFromGoogleTokenInfo(
  db: DrizzleD1Database,
  tokenInfo: TokenInfo,
) {
  return await db
    .insert(accounts)
    .values({
      googleId: tokenInfo.sub,
      email: tokenInfo.email,
      name: tokenInfo.name,
      pictureUrl: tokenInfo.picture,
    })
    .returning({
      id: accounts.id,
    })
    .get();
}

export function getAccountFromGoogle(db: DrizzleD1Database, googleId: string) {
  return db
    .select()
    .from(accounts)
    .where(eq(accounts.googleId, googleId))
    .get();
}

export function getAccount(db: DrizzleD1Database, accountId: number) {
  return db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .get();
}
