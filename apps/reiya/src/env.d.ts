/// <reference types="@types/gsi" />

interface Env {
  DB: import("@cloudflare/workers-types").D1Database;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user?: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string;
    };
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
