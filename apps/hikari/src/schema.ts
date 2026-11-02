import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/** Who someone is on a shoot: the roles a group commission can hold. */
export type CommissionRole = "photographer" | "cosplayer" | "assistant";

export type CommissionStatus =
  | "requested"
  | "accepted"
  | "scheduled"
  | "completed"
  | "delivered";

/** BCP 47 language codes the app ships catalogs for. */
export type Locale = "en" | "fr" | "ja";

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
    timezone: text("timezone").notNull().default("Europe/Paris"),
    locationName: text("location_name").notNull().default(""),
    locationQuery: text("location_query").notNull().default(""),
    locationLat: real("location_lat"),
    locationLng: real("location_lng"),
    shareToken: text("share_token").notNull(),
    invitees: text("invitees").notNull().default("[]"),
    deliveryReadyAt: integer("delivery_ready_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    index("commissions_photographer_idx").on(t.photographerId),
    index("commissions_client_idx").on(t.clientId),
    uniqueIndex("commissions_share_token_idx").on(t.shareToken),
  ],
);

export const commissionAttendees = sqliteTable(
  "commission_attendees",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    commissionId: integer("commission_id")
      .notNull()
      .references(() => commissions.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("commission_attendees_unique_idx").on(t.commissionId, t.userId),
  ],
);

export const commissionLocations = sqliteTable(
  "commission_locations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    commissionId: integer("commission_id")
      .notNull()
      .references(() => commissions.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    accuracy: real("accuracy"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("commission_locations_user_idx").on(t.commissionId, t.userId),
  ],
);

/** A franchise or work: "Genshin Impact", "Frieren". */
export const series = sqliteTable(
  "series",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("series_name_idx").on(t.name)],
);

/** A character, optionally belonging to a series. */
export const characters = sqliteTable(
  "characters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    seriesId: integer("series_id").references(() => series.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    uniqueIndex("characters_name_series_idx").on(t.name, t.seriesId),
    // UNIQUE(name, series_id) cannot dedupe rows without a series: SQLite
    // treats NULLs as distinct, so the bare name needs its own partial index.
    uniqueIndex("characters_name_noseries_idx")
      .on(t.name)
      .where(sql`series_id is null`),
    index("characters_series_idx").on(t.seriesId),
  ],
);

/** What a shoot is photographing. A group shoot can list several. */
export const commissionCharacters = sqliteTable(
  "commission_characters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    commissionId: integer("commission_id")
      .notNull()
      .references(() => commissions.id),
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    position: integer("position").notNull().default(0),
  },
  (t) => [
    uniqueIndex("commission_characters_unique_idx").on(
      t.commissionId,
      t.characterId,
    ),
  ],
);

/**
 * The cast. `userId` is set once someone joins through an invite; a cosplayer
 * without an account still has a row, because the shoot needs their name.
 */
export const commissionCast = sqliteTable(
  "commission_cast",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    commissionId: integer("commission_id")
      .notNull()
      .references(() => commissions.id),
    role: text("role").notNull().$type<CommissionRole>(),
    userId: text("user_id").references(() => users.id),
    displayName: text("display_name").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    uniqueIndex("commission_cast_user_idx").on(
      t.commissionId,
      t.role,
      t.userId,
    ),
    index("commission_cast_commission_idx").on(t.commissionId),
  ],
);

/** A shareable link that grants a role on one shoot, with an optional expiry. */
export const commissionInvites = sqliteTable(
  "commission_invites",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    commissionId: integer("commission_id")
      .notNull()
      .references(() => commissions.id),
    token: text("token").notNull(),
    role: text("role").notNull().$type<CommissionRole>(),
    label: text("label").notNull().default(""),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    revokedAt: integer("revoked_at", { mode: "timestamp" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    uniqueIndex("commission_invites_token_idx").on(t.token),
    index("commission_invites_commission_idx").on(t.commissionId),
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

export const userPreferences = sqliteTable(
  "user_preferences",
  {
    userId: text("user_id")
      .notNull()
      .primaryKey()
      .references(() => users.id),
    locale: text("locale").$type<Locale>(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
);

export const photographerProfiles = sqliteTable(
  "photographer_profiles",
  {
    userId: text("user_id")
      .notNull()
      .primaryKey()
      .references(() => users.id),
    slug: text("slug").notNull(),
    headline: text("headline").notNull().default(""),
    bio: text("bio").notNull().default(""),
    location: text("location").notNull().default(""),
    instagram: text("instagram").notNull().default(""),
    links: text("links").notNull().default("[]"),
    acceptRequests: integer("accept_requests", { mode: "boolean" })
      .notNull()
      .default(true),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("photographer_profiles_slug_idx").on(t.slug)],
);

export interface Schema extends Record<string, unknown> {
  users: typeof users;
  sessions: typeof sessions;
  accounts: typeof accounts;
  verifications: typeof verifications;
  commissions: typeof commissions;
  commissionAttendees: typeof commissionAttendees;
  commissionLocations: typeof commissionLocations;
  commissionPhotos: typeof commissionPhotos;
  series: typeof series;
  characters: typeof characters;
  commissionCharacters: typeof commissionCharacters;
  commissionCast: typeof commissionCast;
  commissionInvites: typeof commissionInvites;
  notifications: typeof notifications;
  rateLimits: typeof rateLimits;
  userPreferences: typeof userPreferences;
  photographerProfiles: typeof photographerProfiles;
}
