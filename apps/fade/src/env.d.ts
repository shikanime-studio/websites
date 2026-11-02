/// <reference types="@webgpu/types" />
/// <reference types="vite/client" />

declare namespace Cloudflare {
  interface Env {
    ACCOUNTS_CLIENT_SECRET: string;
    STUDIO_SESSION_SECRET: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_MIXPANEL_TOKEN: string;
  readonly VITE_MIXPANEL_API_HOST: string;
  readonly VITE_SITE?: string;
  readonly VITE_ACCOUNTS_SITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
