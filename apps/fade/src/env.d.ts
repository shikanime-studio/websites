/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIXPANEL_TOKEN: string;
  readonly VITE_MIXPANEL_API_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
