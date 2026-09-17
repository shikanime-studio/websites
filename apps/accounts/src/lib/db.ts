import type { Schema } from "../schema";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

export function createD1Database() {
  return drizzle<Schema>(env.DB);
}
