import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
});

export const accounts = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const rateLimits = sqliteTable("rate_limits", {
  id: text("id").primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: integer("last_request", { mode: "number" }),
});

export const jwkss = sqliteTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
});

export const oauthClients = sqliteTable("oauth_client", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret"),
  disabled: integer("disabled", { mode: "boolean" }).default(false),
  skipConsent: integer("skip_consent", { mode: "boolean" }).default(false),
  enableEndSession: integer("enable_end_session", { mode: "boolean" }),
  subjectType: text("subject_type"),
  scopes: text("scopes", { mode: "json" }).$type<Array<string>>(),
  userId: text("user_id").references(() => users.id),
  referenceId: text("reference_id"),
  name: text("name"),
  uri: text("uri"),
  icon: text("icon"),
  contacts: text("contacts", { mode: "json" }).$type<Array<string>>(),
  tos: text("tos"),
  policy: text("policy"),
  softwareId: text("software_id"),
  softwareVersion: text("software_version"),
  softwareStatement: text("software_statement"),
  redirectUris: text("redirect_uris", { mode: "json" })
    .notNull()
    .$type<Array<string>>()
    .default(sql`'[]'`),
  postLogoutRedirectUris: text("post_logout_redirect_uris", {
    mode: "json",
  }).$type<Array<string>>(),
  tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
  grantTypes: text("grant_types", { mode: "json" }).$type<Array<string>>(),
  responseTypes: text("response_types", { mode: "json" }).$type<
    Array<string>
  >(),
  public: integer("public", { mode: "boolean" }),
  type: text("type"),
  requirePKCE: integer("require_pkce", { mode: "boolean" }),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const oauthAccessTokens = sqliteTable("oauth_access_token", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  clientId: text("client_id").notNull(),
  sessionId: text("session_id"),
  refreshId: text("refresh_id"),
  userId: text("user_id").references(() => users.id),
  referenceId: text("reference_id"),
  scopes: text("scopes", { mode: "json" })
    .notNull()
    .$type<Array<string>>()
    .default(sql`'[]'`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const oauthRefreshTokens = sqliteTable("oauth_refresh_token", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  clientId: text("client_id").notNull(),
  sessionId: text("session_id"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  referenceId: text("reference_id"),
  scopes: text("scopes", { mode: "json" })
    .notNull()
    .$type<Array<string>>()
    .default(sql`'[]'`),
  revoked: integer("revoked", { mode: "timestamp" }),
  authTime: integer("auth_time", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const oauthConsents = sqliteTable("oauth_consent", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  clientId: text("client_id").notNull(),
  referenceId: text("reference_id"),
  scopes: text("scopes", { mode: "json" })
    .notNull()
    .$type<Array<string>>()
    .default(sql`'[]'`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export interface Schema extends Record<string, unknown> {
  users: typeof users;
  sessions: typeof sessions;
  accounts: typeof accounts;
  verifications: typeof verifications;
  rateLimits: typeof rateLimits;
  jwkss: typeof jwkss;
  oauthClients: typeof oauthClients;
  oauthAccessTokens: typeof oauthAccessTokens;
  oauthRefreshTokens: typeof oauthRefreshTokens;
  oauthConsents: typeof oauthConsents;
}
