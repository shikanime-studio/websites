import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey(),
  googleId: text("google_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  pictureUrl: text("picture_url").notNull(),
});

export const accountsToMakers = sqliteTable(
  "accounts_to_makers",
  {
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    makerId: integer("maker_id")
      .notNull()
      .references(() => makers.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [primaryKey({ columns: [t.accountId, t.makerId] })],
);

export const accountsToMakersRelations = relations(
  accountsToMakers,
  ({ one }) => ({
    account: one(accounts, {
      fields: [accountsToMakers.accountId],
      references: [accounts.id],
    }),
    maker: one(makers, {
      fields: [accountsToMakers.makerId],
      references: [makers.id],
    }),
  }),
);

export const accountsToLicenses = sqliteTable(
  "accounts_to_licenses",
  {
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    licenseId: integer("license_id")
      .notNull()
      .references(() => licenses.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [primaryKey({ columns: [t.accountId, t.licenseId] })],
);

export const accountsToLicensesRelations = relations(
  accountsToLicenses,
  ({ one }) => ({
    account: one(accounts, {
      fields: [accountsToLicenses.accountId],
      references: [accounts.id],
    }),
    license: one(licenses, {
      fields: [accountsToLicenses.licenseId],
      references: [licenses.id],
    }),
  }),
);

export const accountsToCharacters = sqliteTable(
  "accounts_to_characters",
  {
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [primaryKey({ columns: [t.accountId, t.characterId] })],
);

export const accountsToCharactersRelations = relations(
  accountsToCharacters,
  ({ one }) => ({
    account: one(accounts, {
      fields: [accountsToCharacters.accountId],
      references: [accounts.id],
    }),
    character: one(characters, {
      fields: [accountsToCharacters.characterId],
      references: [characters.id],
    }),
  }),
);

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey(),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
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
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
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
  account: one(accounts, {
    fields: [votes.accountId],
    references: [accounts.id],
  }),
  item: one(items, {
    fields: [votes.itemId],
    references: [items.id],
  }),
}));
