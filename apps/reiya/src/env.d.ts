/// <reference types="vite/client" />

declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_SECRET: string;
    ACCOUNTS_CLIENT_SECRET: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_PUBLIC_GOOGLE_CLIENT_ID: string;
  readonly VITE_SITE: string;
  readonly VITE_ACCOUNTS_SITE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
