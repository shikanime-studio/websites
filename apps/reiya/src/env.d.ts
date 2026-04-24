/// <reference types="@types/gsi" />

declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_SECRET: string;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_CLIENT_ID: string;
  readonly SITE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
