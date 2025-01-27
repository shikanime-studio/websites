import { drizzle } from "drizzle-orm/d1";
import { accountTable } from "../schema";
import { eq } from "drizzle-orm";
import type { SessionTokenInfo } from "./google";

const db = drizzle(import.meta.env.DB);

export async function createAccountFromGoogleFlow(tokenInfo: SessionTokenInfo) {
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

export function getAccountFromGoogleFlow(googleId: string) {
  return db
    .select()
    .from(accountTable)
    .where(eq(accountTable.googleId, googleId))
    .get();
}
