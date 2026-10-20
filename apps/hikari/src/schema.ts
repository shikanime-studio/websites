import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type CommissionStatus =
  | "requested"
  | "accepted"
  | "scheduled"
  | "completed"
  | "delivered";

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

export const commissions = sqliteTable(
  "commissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: text("status")
      .notNull()
      .default("requested")
      .$type<CommissionStatus>(),
    photographerId: text("photographer_id")
      .notNull()
      .references(() => users.id),
    clientId: text("client_id")
      .notNull()
      .references(() => users.id),
    characterName: text("character_name").notNull().default(""),
    shootingDate: text("shooting_date"),
    locationName: text("location_name").notNull().default(""),
    locationQuery: text("location_query").notNull().default(""),
    deliveryReadyAt: integer("delivery_ready_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    index("commissions_photographer_idx").on(t.photographerId),
    index("commissions_client_idx").on(t.clientId),
  ],
);

export const commissionPhotos = sqliteTable(
  "commission_photos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    commissionId: integer("commission_id")
      .notNull()
      .references(() => commissions.id),
    objectKey: text("object_key").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("commission_photos_commission_idx").on(t.commissionId)],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    relatedId: integer("related_id"),
    relatedType: text("related_type"),
    isRead: integer("is_read", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

export const rateLimits = sqliteTable("rate_limits", {
  id: text("id").primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: integer("last_request", { mode: "number" }),
});

export interface Schema extends Record<string, unknown> {
  users: typeof users;
  sessions: typeof sessions;
  accounts: typeof accounts;
  verifications: typeof verifications;
  commissions: typeof commissions;
  commissionPhotos: typeof commissionPhotos;
  notifications: typeof notifications;
  rateLimits: typeof rateLimits;
}
