import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

/**
 * Hikari's Astryx theme.
 *
 * Astryx components read semantic tokens from the theme wrapper, so this file
 * — not `global.css` — is what re-skins Button, Badge, Card, TextInput and the
 * rest. The `--hk-*` variables in `global.css` are the same palette, kept for
 * the few bespoke surfaces (hero mock, progress rails, decorative grounds)
 * that are not Astryx components.
 *
 * Values are [light, dark] tuples: defineTheme turns them into light-dark().
 */
export const hikariTheme = defineTheme({
  name: "hikari",
  extends: neutralTheme,
  tokens: {
    /* Surfaces */
    "--color-background-body": ["#f5f4ef", "#0a0c0e"],
    "--color-background-surface": ["#fffefb", "#14171a"],
    "--color-background-card": ["#fffefb", "#14171a"],
    "--color-background-popover": ["#ffffff", "#191d21"],
    "--color-background-muted": ["#eeede6", "#1c2024"],
    "--color-background-inverted": ["#0a1317", "#f4f3ee"],

    /* Text */
    "--color-text-primary": ["#0a1317", "#f4f3ee"],
    "--color-text-secondary": ["#4e606f", "#a7b0b8"],
    "--color-text-disabled": ["#636e79", "#78838d"],
    "--color-text-accent": ["#0064e0", "#4d9fff"],
    "--color-icon-primary": ["#0a1317", "#f4f3ee"],
    "--color-icon-secondary": ["#4e606f", "#a7b0b8"],

    /* Action */
    "--color-accent": ["#0064e0", "#4d9fff"],
    "--color-accent-muted": ["#e8f1ff", "#16283f"],
    "--color-on-accent": ["#ffffff", "#06101d"],
    "--color-neutral": ["#0000000f", "#ffffff14"],
    "--color-tint-hover": ["#000000", "#ffffff"],

    /* Rules */
    "--color-border": ["#e3e1d7", "#262b30"],
    "--color-border-emphasized": ["#cfccc0", "#384047"],

    /* Status */
    "--color-success": ["#0b7a3b", "#6ed99a"],
    "--color-success-muted": ["#e4f5e9", "#10291b"],
    "--color-on-success": ["#ffffff", "#06130c"],
    "--color-warning": ["#8a5b00", "#f0c96a"],
    "--color-warning-muted": ["#fff1cd", "#302509"],
    "--color-on-warning": ["#ffffff", "#1c1403"],
    "--color-error": ["#bf3529", "#ff9d92"],
    "--color-error-muted": ["#fbeae7", "#2e1512"],
    "--color-on-error": ["#ffffff", "#220d0a"],

    /* Hue tints used by Badge, so status chips stay paper-soft */
    "--color-background-blue": ["#e8f1ff", "#16283f"],
    "--color-border-blue": ["#cfe2ff", "#24405f"],
    "--color-text-blue": ["#0050b8", "#9cc9ff"],
    "--color-background-yellow": ["#fff4c4", "#332a08"],
    "--color-border-yellow": ["#f2df9a", "#4b3d0d"],
    "--color-text-yellow": ["#4a3a00", "#ffe9a3"],
    "--color-background-purple": ["#e9e9ff", "#1f1d3d"],
    "--color-border-purple": ["#d6d5fb", "#33305e"],
    "--color-text-purple": ["#3f3a9e", "#b9b4ff"],
    "--color-background-green": ["#e4f5e9", "#10291b"],
    "--color-border-green": ["#c9e8d2", "#1d4530"],
    "--color-text-green": ["#0b7a3b", "#6ed99a"],
    "--color-background-gray": ["#eef0f2", "#212730"],
    "--color-border-gray": ["#dfe3e7", "#2e363f"],
    "--color-text-gray": ["#45596b", "#b9c3cc"],

    /* Radii: generous cards, 12px controls; buttons are pilled by
     * --_button-radius in global.css. */
    "--radius-inner": "8px",
    "--radius-element": "12px",
    "--radius-container": "24px",
    "--radius-page": "32px",

    "--color-skeleton": ["#e9e7dd", "#232830"],
    "--color-shadow": ["#0a13171a", "#00000066"],
  },
  typography: {
    body: {
      family: "Inter",
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    heading: {
      family: "Bricolage Grotesque Variable",
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      weight: "semibold",
    },
    code: {
      family: "ui-monospace",
      fallbacks: '"SFMono-Regular", "SF Mono", Menlo, Consolas, monospace',
    },
  },
});
