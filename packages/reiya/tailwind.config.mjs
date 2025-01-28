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
          primary: "#f62714",
          secondary: "#2800ff",
          accent: "#00e6ff",
          neutral: "#071a13",
          "base-100": "#fffaff",
          info: "#00d5ff",
          success: "#00ce9a",
          warning: "#d28f00",
          error: "#ff1e4d",
        },
      },
    ],
  },
  plugins: [typography, daisyui],
};
