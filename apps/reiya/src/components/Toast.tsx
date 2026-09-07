import { useToast } from "@astryxdesign/core/Toast";

export interface ToastOptions {
  type?: "info" | "error";
  duration?: number;
}

/**
 * Imperative toast helper backed by the Astryx toast system.
 * Replaces the former daisyUI `toast` positioning classes.
 */
export function useAppToast() {
  const showToast = useToast();

  return (message: string, options: ToastOptions = {}) =>
    showToast({
      body: message,
      type: options.type ?? "error",
      isAutoHide: true,
      autoHideDuration: options.duration ?? 3000,
    });
}
