import { relations } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

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

export const jwks = sqliteTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  alg: text("alg"),
  crv: text("crv"),
});

export const oauthClients = sqliteTable("oauth_client", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret"),
  clientDiscoveryId: text("client_discovery_id"),
  disabled: integer("disabled", { mode: "boolean" }).default(false),
  skipConsent: integer("skip_consent", { mode: "boolean" }),
  enableEndSession: integer("enable_end_session", { mode: "boolean" }),
  subjectType: text("subject_type"),
  scopes: text("scopes", { mode: "json" }).$type<Array<string>>(),
  clientCredentialsScopes: text("client_credentials_scopes", {
    mode: "json",
  }).$type<Array<string>>(),
  userId: text("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
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
    .$type<Array<string>>(),
  postLogoutRedirectUris: text("post_logout_redirect_uris", {
    mode: "json",
  }).$type<Array<string>>(),
  backchannelLogoutUri: text("backchannel_logout_uri"),
  backchannelLogoutSessionRequired: integer(
    "backchannel_logout_session_required",
    { mode: "boolean" },
  ),
  tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
  applicationType: text("application_type"),
  jwks: text("jwks"),
  jwksUri: text("jwks_uri"),
  grantTypes: text("grant_types", { mode: "json" }).$type<Array<string>>(),
  responseTypes: text("response_types", { mode: "json" }).$type<
    Array<string>
  >(),
  requirePKCE: integer("require_pkce", { mode: "boolean" }),
  dpopBoundAccessTokens: integer("dpop_bound_access_tokens", {
    mode: "boolean",
  }).default(false),
  referenceId: text("reference_id"),
  metadata: text("metadata", { mode: "json" }),
});

export const oauthAccessTokens = sqliteTable("oauth_access_token", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClients.clientId),
  sessionId: text("session_id").references(() => sessions.id),
  userId: text("user_id").references(() => users.id),
  referenceId: text("reference_id"),
  authorizationCodeId: text("authorization_code_id"),
  resources: text("resources", { mode: "json" }).$type<Array<string>>(),
  requestedUserInfoClaims: text("requested_user_info_claims", {
    mode: "json",
  }).$type<Array<string>>(),
  refreshId: text("refresh_id"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  revoked: integer("revoked", { mode: "timestamp" }),
  confirmation: text("confirmation", { mode: "json" }),
  scopes: text("scopes", { mode: "json" })
    .notNull()
    .$type<Array<string>>(),
});

export const oauthRefreshTokens = sqliteTable("oauth_refresh_token", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClients.clientId),
  sessionId: text("session_id").references(() => sessions.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  referenceId: text("reference_id"),
  authorizationCodeId: text("authorization_code_id"),
  resources: text("resources", { mode: "json" }).$type<Array<string>>(),
  requestedUserInfoClaims: text("requested_user_info_claims", {
    mode: "json",
  }).$type<Array<string>>(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  revoked: integer("revoked", { mode: "timestamp" }),
  rotatedAt: integer("rotated_at", { mode: "timestamp" }),
  rotationReplayResponse: text("rotation_replay_response"),
  rotationReplayExpiresAt: integer("rotation_replay_expires_at", {
    mode: "timestamp",
  }),
  authTime: integer("auth_time", { mode: "timestamp" }),
  confirmation: text("confirmation", { mode: "json" }),
  scopes: text("scopes", { mode: "json" })
    .notNull()
    .$type<Array<string>>(),
});

export const oauthConsents = sqliteTable("oauth_consent", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClients.clientId),
  userId: text("user_id").references(() => users.id),
  referenceId: text("reference_id"),
  resources: text("resources", { mode: "json" }).$type<Array<string>>(),
  requestedUserInfoClaims: text("requested_user_info_claims", {
    mode: "json",
  }).$type<Array<string>>(),
  scopes: text("scopes", { mode: "json" })
    .notNull()
    .$type<Array<string>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const oauthClientAssertions = sqliteTable("oauth_client_assertion", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const oauthResources = sqliteTable("oauth_resource", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull().unique(),
  name: text("name").notNull(),
  accessTokenTtl: integer("access_token_ttl"),
  refreshTokenTtl: integer("refresh_token_ttl"),
  signingAlgorithm: text("signing_algorithm"),
  signingKeyId: text("signing_key_id"),
  allowedScopes: text("allowed_scopes", { mode: "json" }).$type<
    Array<string>
  >(),
  customClaims: text("custom_claims", { mode: "json" }),
  dpopBoundAccessTokensRequired: integer(
    "dpop_bound_access_tokens_required",
    { mode: "boolean" },
  ).default(false),
  disabled: integer("disabled", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  policyVersion: integer("policy_version").default(1),
  metadata: text("metadata", { mode: "json" }),
});

export const oauthClientResources = sqliteTable("oauth_client_resource", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClients.clientId),
  resourceId: text("resource_id")
    .notNull()
    .references(() => oauthResources.id),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export interface Schema extends Record<string, unknown> {
  users: typeof users;
  sessions: typeof sessions;
  accounts: typeof accounts;
  verifications: typeof verifications;
  rateLimits: typeof rateLimits;
  jwks: typeof jwks;
  oauthClients: typeof oauthClients;
  oauthAccessTokens: typeof oauthAccessTokens;
  oauthRefreshTokens: typeof oauthRefreshTokens;
  oauthConsents: typeof oauthConsents;
  oauthClientAssertions: typeof oauthClientAssertions;
  oauthResources: typeof oauthResources;
  oauthClientResources: typeof oauthClientResources;
  usersRelations: typeof usersRelations;
  sessionsRelations: typeof sessionsRelations;
  accountsRelations: typeof accountsRelations;
}
