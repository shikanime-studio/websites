import { users, accounts } from "../schema";
import { getTokenInfo } from "./google";
import type { OAuth2Tokens } from "arctic";
import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";

export async function createUserFromTokens(
  db: DrizzleD1Database,
  tokens: OAuth2Tokens,
) {
  const tokenInfo = getTokenInfo(tokens.idToken());

  return await db.transaction(async (tx) => {
    // Create the user first
    const user = await tx
      .insert(users)
      .values({
        email: tokenInfo.email,
        name: tokenInfo.name,
        pictureUrl: tokenInfo.picture,
      })
      .returning({
        id: users.id,
      })
      .get();

    // Create the associated Google account
    await tx.insert(accounts).values({
      userId: user.id,
      provider: "google",
      subject: tokenInfo.sub,
      accessToken: tokens.accessToken(),
      accessTokenExpiresAt: tokens.accessTokenExpiresAt(),
      refreshToken: tokens.refreshToken(),
      scope: tokens.scopes(),
    });

    return user;
  });
}

export function getUserFromTokens(db: DrizzleD1Database, tokens: OAuth2Tokens) {
  const tokenInfo = getTokenInfo(tokens.idToken());
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      pictureUrl: users.pictureUrl,
    })
    .from(users)
    .innerJoin(accounts, eq(accounts.userId, users.id))
    .where(eq(accounts.subject, tokenInfo.sub))
    .get();
}

export function getUser(db: DrizzleD1Database, userId: number) {
  return db.select().from(users).where(eq(users.id, userId)).get();
}
