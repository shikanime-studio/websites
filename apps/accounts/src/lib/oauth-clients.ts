import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  oauthAccessTokens,
  oauthClients,
  oauthConsents,
  oauthRefreshTokens,
} from "../schema";
import { createAuth } from "./auth";
import { createD1Database } from "./db";

export interface AuthorizedClient {
  clientId: string;
  name: string | null;
  scopes: string[];
  authorizedAt: string | null;
}

/** D1 may hand JSON columns back as strings; never trust the shape. */
export function normalizeScopes(value: unknown): string[] {
  const parsed = typeof value === "string"
    ? (() => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        return [];
      }
    })()
    : value;
  return Array.isArray(parsed)
    ? parsed.filter((scope): scope is string => typeof scope === "string")
    : [];
}

export const listAuthorizedClients = createServerFn().handler(
  async (): Promise<AuthorizedClient[]> => {
    const request = getRequest();
    const db = createD1Database();
    const auth = createAuth(db);
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return [];
    }
    const rows = await db
      .select({
        clientId: oauthConsents.clientId,
        name: oauthClients.name,
        scopes: oauthConsents.scopes,
        authorizedAt: oauthConsents.createdAt,
      })
      .from(oauthConsents)
      .innerJoin(
        oauthClients,
        eq(oauthClients.clientId, oauthConsents.clientId),
      )
      .where(eq(oauthConsents.userId, session.user.id));
    return rows.map((row) => ({
      clientId: row.clientId,
      name: row.name,
      scopes: normalizeScopes(row.scopes),
      authorizedAt: row.authorizedAt ? row.authorizedAt.toISOString() : null,
    }));
  },
);

export const revokeClientAccess = createServerFn()
  .validator((input: unknown): string => {
    if (typeof input !== "string" || input.length === 0) {
      throw new Error("clientId is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const clientId = data;
    const request = getRequest();
    const db = createD1Database();
    const auth = createAuth(db);
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;
    await db
      .delete(oauthAccessTokens)
      .where(
        and(
          eq(oauthAccessTokens.userId, userId),
          eq(oauthAccessTokens.clientId, clientId),
        ),
      );
    await db
      .delete(oauthRefreshTokens)
      .where(
        and(
          eq(oauthRefreshTokens.userId, userId),
          eq(oauthRefreshTokens.clientId, clientId),
        ),
      );
    await db
      .delete(oauthConsents)
      .where(
        and(
          eq(oauthConsents.userId, userId),
          eq(oauthConsents.clientId, clientId),
        ),
      );
  });

export const clientIdSchema = z.string().min(1);
