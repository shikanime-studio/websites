import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  pictureUrl: text("picture_url").notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  provider: text("provider").notNull(),
  subject: text("subject").notNull(),
  accessToken: text("access_token"),
  accessTokenExpiresAt: integer("expires_at"),
  refreshToken: text("refresh_token"),
  scope: text("scope"),
});

export const userToAccounts = sqliteTable("user_to_accounts", {
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
});

export const usersToMakers = sqliteTable(
  "users_to_makers",
  {
    userId: integer("user_id")
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
    userId: integer("user_id")
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
    userId: integer("user_id")
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

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: text("expires_at")
    .notNull()
    .default(sql`(datetime('now', '+30 days'))`),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
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
});

export const licenseRelations = relations(licenses, ({ many }) => ({
  characters: many(characters),
}));

export const characters = sqliteTable("characters", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const makers = sqliteTable("makers", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  avatarImageUrl: text("avatar_image_url"),
  coverImageUrl: text("cover_image_url"),
  links: text("links", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrls: text("image_urls", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
});

export const itemsToLicenses = sqliteTable(
  "items_to_licenses",
  {
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    licenseId: integer("group_id")
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
  userId: integer("user_id")
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
