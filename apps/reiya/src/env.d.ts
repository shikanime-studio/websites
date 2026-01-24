/// <reference types="@types/gsi" />
import type { D1Database } from "@cloudflare/workers-types";
import type { Runtime } from "@astrojs/cloudflare";

interface RuntimeEnv {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
}

declare global {
  namespace App {
    interface Locals extends Runtime<RuntimeEnv> {
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
    readonly SITE: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
