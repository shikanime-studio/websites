import { relations, sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
});

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

export const usersToMakers = sqliteTable(
  "users_to_makers",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    makerId: integer("maker_id")
      .notNull()
      .references(() => makers.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.makerId] })],
);

export const usersToMakersRelations = relations(usersToMakers, ({ one }) => ({
  user: one(users, {
    fields: [usersToMakers.userId],
    references: [users.id],
  }),
  maker: one(makers, {
    fields: [usersToMakers.makerId],
    references: [makers.id],
  }),
}));

export const usersToLicenses = sqliteTable(
  "users_to_licenses",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    licenseId: integer("license_id")
      .notNull()
      .references(() => licenses.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.licenseId] })],
);

export const usersToLicensesRelations = relations(
  usersToLicenses,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToLicenses.userId],
      references: [users.id],
    }),
    license: one(licenses, {
      fields: [usersToLicenses.licenseId],
      references: [licenses.id],
    }),
  }),
);

export const usersToCharacters = sqliteTable(
  "users_to_characters",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.characterId] })],
);

export const usersToCharactersRelations = relations(
  usersToCharacters,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToCharacters.userId],
      references: [users.id],
    }),
    character: one(characters, {
      fields: [usersToCharacters.characterId],
      references: [characters.id],
    }),
  }),
);

export const events = sqliteTable("events", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  imageWidth: integer("image_width").notNull().default(0),
  imageHeight: integer("image_height").notNull().default(0),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  location: text("location"),
  eventType: text("event_type"),
  websiteUrl: text("website_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const eventsToMakers = sqliteTable(
  "events_to_makers",
  {
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    makerId: integer("maker_id")
      .notNull()
      .references(() => makers.id),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.makerId] })],
);

export const eventsToMakersRelations = relations(eventsToMakers, ({ one }) => ({
  event: one(events, {
    fields: [eventsToMakers.eventId],
    references: [events.id],
  }),
  maker: one(makers, {
    fields: [eventsToMakers.makerId],
    references: [makers.id],
  }),
}));

export const licenses = sqliteTable("licenses", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  imageWidth: integer("image_width").notNull().default(0),
  imageHeight: integer("image_height").notNull().default(0),
});

export const licenseRelations = relations(licenses, ({ many }) => ({
  characters: many(characters),
}));

export const characters = sqliteTable("characters", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  imageWidth: integer("image_width").notNull().default(0),
  imageHeight: integer("image_height").notNull().default(0),
});

export const makers = sqliteTable("makers", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  avatarImageUrl: text("avatar_image_url"),
  avatarImageWidth: integer("avatar_image_width").default(0),
  avatarImageHeight: integer("avatar_image_height").default(0),
  coverImageUrl: text("cover_image_url"),
  coverImageWidth: integer("cover_image_width").default(0),
  coverImageHeight: integer("cover_image_height").default(0),
  links: text("links", { mode: "json" })
    .notNull()
    .$type<Array<string>>()
    .default(sql`'[]'`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrls: text("image_urls", { mode: "json" })
    .notNull()
    .$type<Array<{ src: string; width: number; height: number }>>()
    .default(sql`'[]'`),
  category: text("category"),
  priceRange: text("price_range"),
  availabilityStatus: text("availability_status").default("available"),
  makerId: integer("maker_id").references(() => makers.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const itemsToLicenses = sqliteTable(
  "items_to_licenses",
  {
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    licenseId: integer("license_id")
      .notNull()
      .references(() => licenses.id),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.licenseId] })],
);

export const itemsToLicensesRelations = relations(
  itemsToLicenses,
  ({ one }) => ({
    item: one(items, {
      fields: [itemsToLicenses.itemId],
      references: [items.id],
    }),
    license: one(licenses, {
      fields: [itemsToLicenses.licenseId],
      references: [licenses.id],
    }),
  }),
);

export const votes = sqliteTable("votes", {
  id: integer("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  type: text("type").notNull().$type<"upvote" | "downvote">(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [votes.itemId],
    references: [items.id],
  }),
}));

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"),
  relatedType: text("related_type"),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const rateLimits = sqliteTable("rate_limits", {
  id: text("id").primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: integer("last_request", { mode: "number" }),
});

// Relations
export const makersRelations = relations(makers, ({ many }) => ({
  items: many(items),
  events: many(eventsToMakers),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  maker: one(makers, {
    fields: [items.makerId],
    references: [makers.id],
  }),
  licenses: many(itemsToLicenses),
  votes: many(votes),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  makers: many(eventsToMakers),
}));

export const charactersRelations = relations(characters, ({ many }) => ({
  licenses: many(licenses),
}));

export interface Schema extends Record<string, unknown> {
  categories: typeof categories;
  users: typeof users;
  sessions: typeof sessions;
  accounts: typeof accounts;
  verifications: typeof verifications;
  usersToMakers: typeof usersToMakers;
  usersToMakersRelations: typeof usersToMakersRelations;
  usersToLicenses: typeof usersToLicenses;
  usersToLicensesRelations: typeof usersToLicensesRelations;
  usersToCharacters: typeof usersToCharacters;
  usersToCharactersRelations: typeof usersToCharactersRelations;
  events: typeof events;
  eventsToMakers: typeof eventsToMakers;
  eventsToMakersRelations: typeof eventsToMakersRelations;
  licenses: typeof licenses;
  licenseRelations: typeof licenseRelations;
  characters: typeof characters;
  makers: typeof makers;
  items: typeof items;
  itemsToLicenses: typeof itemsToLicenses;
  itemsToLicensesRelations: typeof itemsToLicensesRelations;
  votes: typeof votes;
  votesRelations: typeof votesRelations;
  notifications: typeof notifications;
  rateLimits: typeof rateLimits;
  makersRelations: typeof makersRelations;
  itemsRelations: typeof itemsRelations;
  eventsRelations: typeof eventsRelations;
  charactersRelations: typeof charactersRelations;
}
