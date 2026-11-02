import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

/**
 * Hikari's Astryx theme — warm, candy-coloured, sticker-friendly.
 *
 * References: Ko-fi's lilac/coral/sky palette, Vgen's image-forward cards
 * and candy status badges, Booth's chunky coloured tags. The paper canvas
 * keeps the app feeling like a desk, not a dashboard.
 *
 * Values are [light, dark] tuples: defineTheme turns them into light-dark().
 */
export const hikariTheme = defineTheme({
  name: "hikari",
  extends: neutralTheme,
  tokens: {
    /* Surfaces: warm cream, white cards. */
    "--color-background-body": ["#fff8f0", "#171110"],
    "--color-background-surface": ["#ffffff", "#211a17"],
    "--color-background-card": ["#ffffff", "#211a17"],
    "--color-background-popover": ["#ffffff", "#26201c"],
    "--color-background-muted": ["#fff1e4", "#2a211c"],
    "--color-background-inverted": ["#241c18", "#fff4e9"],

    /* Ink: warm near-black, like Ko-fi's #202020 with a tan cast. */
    "--color-text-primary": ["#241c18", "#fff4e9"],
    "--color-text-secondary": ["#6f6058", "#cdbdb2"],
    "--color-text-disabled": ["#8a776c", "#8e7f75"],
    "--color-text-accent": ["#c43d10", "#ffb59a"],
    "--color-icon-primary": ["#241c18", "#fff4e9"],
    "--color-icon-secondary": ["#6f6058", "#cdbdb2"],

    /* Action: Ko-fi coral, with ink text so buttons stay readable and fun. */
    "--color-accent": ["#ff6433", "#ff7a4d"],
    "--color-accent-muted": ["#ffe4d8", "#3a1e14"],
    "--color-on-accent": ["#241c18", "#241c18"],
    "--color-neutral": ["#241c180d", "#ffffff14"],
    "--color-tint-hover": ["#241c18", "#ffffff"],

    /* Rules: warm, low-contrast hairlines. */
    "--color-border": ["#f2e2d3", "#3a2c24"],
    "--color-border-emphasized": ["#e4cdba", "#4a382d"],

    /* Status */
    "--color-success": ["#1f7a4a", "#7ee0a6"],
    "--color-success-muted": ["#e4f7ec", "#12291d"],
    "--color-on-success": ["#ffffff", "#062013"],
    "--color-warning": ["#a96a00", "#ffc46b"],
    "--color-warning-muted": ["#fff0c8", "#33240a"],
    "--color-on-warning": ["#241c18", "#241c18"],
    "--color-error": ["#d6402f", "#ff9a8a"],
    "--color-error-muted": ["#fde7e3", "#33130f"],
    "--color-on-error": ["#ffffff", "#2a0d08"],

    /* Candy badge tints: solid sticker colours with ink text. */
    "--color-background-purple": ["#d9c2ff", "#3a2a55"],
    "--color-border-purple": ["#c9a7ff", "#6b4f9e"],
    "--color-text-purple": ["#241c18", "#e8d9ff"],
    "--color-background-blue": ["#b9daff", "#1d3247"],
    "--color-border-blue": ["#8cc4ff", "#3e6f9e"],
    "--color-text-blue": ["#241c18", "#d6e9ff"],
    "--color-background-yellow": ["#ffe07a", "#3a2f0c"],
    "--color-border-yellow": ["#ffd84d", "#6b5713"],
    "--color-text-yellow": ["#241c18", "#ffe9a3"],
    "--color-background-orange": ["#ffb08f", "#3d1f12"],
    "--color-border-orange": ["#ff8a5c", "#7a3a1e"],
    "--color-text-orange": ["#241c18", "#ffc7b0"],
    "--color-background-green": ["#ddf7a0", "#26360f"],
    "--color-border-green": ["#c8f56a", "#4a6b1e"],
    "--color-text-green": ["#241c18", "#e2f7b0"],
    "--color-background-pink": ["#ffc9da", "#3b1c28"],
    "--color-border-pink": ["#ffa8c5", "#7a3850"],
    "--color-text-pink": ["#241c18", "#ffd9e5"],
    "--color-background-gray": ["#f2e9e1", "#2b231e"],
    "--color-border-gray": ["#e4d5c8", "#4a3a30"],
    "--color-text-gray": ["#5e5048", "#d8c8bd"],

    /* Radii: chunky cards, soft controls; buttons stay pills. */
    "--radius-inner": "10px",
    "--radius-element": "14px",
    "--radius-container": "26px",
    "--radius-page": "34px",

    "--color-skeleton": ["#ffe9d8", "#33261f"],
    "--color-shadow": ["#5a37231a", "#00000066"],
  },
  typography: {
    body: {
      family: "ui-rounded",
      fallbacks:
        '"SF Pro Rounded", "Hiragino Maru Gothic ProN", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
