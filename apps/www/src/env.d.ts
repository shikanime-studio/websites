/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_MIXPANEL_TOKEN: string;
  readonly PUBLIC_MIXPANEL_API_HOST?: string;
}

declare namespace App {
  interface Locals {
    /**
     * Session resolved from the accounts IdP by `src/middleware.ts`.
     * `null` for anonymous visitors (or when the IdP could not be reached).
     */
    user?: import("@shikanime-studio/auth-shared").SessionResult | null;
  }
}
