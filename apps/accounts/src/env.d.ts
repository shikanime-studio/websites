/// <reference types="vite/client" />

declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_URL: string;
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    REIYA_CLIENT_SECRET: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
