/// <reference types="@types/gsi" />

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
  readonly GOOGLE_CLIENT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
