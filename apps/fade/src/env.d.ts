/// <reference types="@webgpu/types" />
/// <reference types="vite/client" />

declare module "*.css?url" {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_MIXPANEL_TOKEN: string;
  readonly VITE_MIXPANEL_API_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
