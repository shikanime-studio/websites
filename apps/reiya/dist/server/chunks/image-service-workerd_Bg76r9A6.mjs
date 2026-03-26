globalThis.process ??= {};
globalThis.process.env ??= {};
import { b as baseService } from "./_astro_assets_UB9B5S7h.mjs";
import "./worker-entry_kwuYKouP.mjs";
const service = {
  ...baseService,
  async transform(inputBuffer, transform) {
    return { data: inputBuffer, format: transform.format };
  }
};
var image_service_workerd_default = service;
export {
  image_service_workerd_default as default
};
