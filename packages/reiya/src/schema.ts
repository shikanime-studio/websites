import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const accountTable = sqliteTable("account", {
  id: integer("id").primaryKey(),
  googleId: text("google_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  pictureUrl: text("avatar_url").notNull(),
});

export const sessionTable = sqliteTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: integer("account_id")
    .notNull()
    .references(() => accountTable.id),
  expiresAt: integer("expires_at", {
    mode: "timestamp",
  })
    .notNull()
    .default(sql`(datetime('now', '+30 days'))`),
});
