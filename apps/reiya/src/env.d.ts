/// <reference types="@types/gsi" />

declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_SECRET: string
    GOOGLE_CLIENT_SECRET: string
  }
}

declare global {
  interface ImportMeta {
    readonly env: {
      readonly PUBLIC_GOOGLE_CLIENT_ID: string
      readonly SITE: string
    }
  }
}
