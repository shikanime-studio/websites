/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_MIXPANEL_TOKEN: string
  readonly PUBLIC_MIXPANEL_API_HOST?: string
}
