import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const accountsTable = sqliteTable("accounts", {
  id: integer("id").primaryKey(),
  googleId: text("google_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  pictureUrl: text("picture_url").notNull(),
});

export const sessionsTable = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: integer("account_id")
    .notNull()
    .references(() => accountsTable.id),
  expiresAt: text("expires_at")
    .notNull()
    .default(sql`(datetime('now', '+30 days'))`),
});
