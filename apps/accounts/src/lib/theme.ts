import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

// Shikanime Studio brand theme — derived from the shikanime.studio landing
// palette (primary #f5712c) on top of the neutral base. Astryx exposes no
// dedicated primary slot: the accent token pair IS the primary (filled
// buttons, selection, focus), so the brand orange rides those tokens.
const shikanimeTheme = defineTheme({
  name: "shikanime",
  extends: neutralTheme,
  tokens: {
    // Saturated brand-orange fill for buttons/badges; dark mode lifts to the
    // pastel with dark text (theme-neutral filled-badge rubric).
    "--color-accent": ["#f5712c", "#ffa258"],
    "--color-on-accent": ["#ffffff", "#171717"],
    // Soft orange surface tint (hover fills, muted chips).
    "--color-accent-muted": ["#fad0b5", "#ffa2583D"],
    // Text/icon accent: dark T30 orange for readability on light pastels,
    // pastel T80 in dark (status rubric).
    "--color-text-accent": ["#6e3500", "#ffc9a2"],
    "--color-icon-accent": ["#6e3500", "#ffa258"],
    // Inset focus/selection rings track the brand hue.
    "--shadow-inset-hover": "inset 0px 0px 0px 2px #f5712c4D",
    "--shadow-inset-selected": "inset 0px 0px 0px 2px #f5712c80",
    // Sharp geometry — flat edges, small inner radii only.
    "--radius-inner": "0.125rem",
    "--radius-element": "0.125rem",
    "--radius-container": "0.25rem",
    "--radius-page": "0.5rem",
  },
  components: {
    button: {
      "variant:primary": {
        backgroundColor: "var(--color-accent)",
        color: "var(--color-on-accent)",
        fontWeight: "700",
      },
    },
    link: {
      base: {
        color: "var(--color-text-accent)",
      },
    },
  },
});

export { shikanimeTheme };
