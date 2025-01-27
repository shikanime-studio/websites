import { drizzle } from "drizzle-orm/d1";
import { accountTable, sessionTable } from "../schema";
import { eq } from "drizzle-orm";
import type { TokenInfo } from "./google";

const db = drizzle(import.meta.env.DB);

export async function createAccountFromGoogleTokenInfo(tokenInfo: TokenInfo) {
  return await db
    .insert(accountTable)
    .values({
      googleId: tokenInfo.sub,
      email: tokenInfo.email,
      name: tokenInfo.name,
      pictureUrl: tokenInfo.picture,
    })
    .returning({
      id: accountTable.id,
    })
    .get();
}

export function getAccountFromGoogle(googleId: string) {
  return db
    .select()
    .from(accountTable)
    .where(eq(accountTable.googleId, googleId))
    .get();
}

export function getAccount(userId: number) {
  return db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, userId))
    .get();
}
