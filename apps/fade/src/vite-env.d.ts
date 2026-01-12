/// <reference types="vite/client" />
/// <reference types="@webgpu/types" />

declare module "*.css?url" {
  const content: string;
  export default content;
}
