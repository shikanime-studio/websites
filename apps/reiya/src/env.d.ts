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
    runtime: {
      env: {
        BETTER_AUTH_SECRET: string;
        GOOGLE_CLIENT_SECRET: string;
        MAL_CLIENT_ID: string;
        MAL_CLIENT_SECRET: string;
      };
    };
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
