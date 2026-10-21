import type { ToastOptions } from "@astryxdesign/core/Toast";

const defaults = {
  type: "error",
  isAutoHide: true,
  autoHideDuration: 3000,
} as const;

/** App toast factory: defaults first, caller overrides win. */
export const showToast =
  (toast: (options: ToastOptions) => unknown) =>
  (body: string, override: Partial<ToastOptions> = {}): unknown =>
    toast({ ...defaults, ...override, body });
