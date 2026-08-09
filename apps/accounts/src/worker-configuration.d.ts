/// <reference types="@cloudflare/workers-types" />

interface Env {
	DB: D1Database;
	[key: string]: unknown;
}

declare module "cloudflare:test" {
	interface ProvidedEnv extends Env {}
}

export {};
export type { Env };
