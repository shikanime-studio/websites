import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transfers = sqliteTable("transfer", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  size: integer("size").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export interface Schema extends Record<string, unknown> {
  transfers: typeof transfers;
}
