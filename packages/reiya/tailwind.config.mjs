import typography from "@tailwindcss/typography";
import daisyui from "daisyui";
import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,svelte,vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Variable", ...fontFamily.sans],
      },
    },
  },
  daisyui: {
    themes: [
      {
        dragonred: {
          primary: "#ed2533",
          secondary: "#f4ceb5",
          accent: "#c6a4ea",
          neutral: "#3c283e",
          "base-100": "#ffffff",
          info: "#9bafe8",
          success: "#7de3d6",
          warning: "#c6970c",
          error: "#e2405b",
        },
      },
    ],
  },
  plugins: [typography, daisyui],
};
