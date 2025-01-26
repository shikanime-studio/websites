import { fontFamily } from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

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
        void: {
          primary: "#f3ef00",
          secondary: "#009af9",
          accent: "#00977e",
          neutral: "#000509",
          "base-100": "#462a7d",
          info: "#00cbf8",
          success: "#00a260",
          warning: "#e59200",
          error: "#ff4d5e",
        },
      },
    ],
  },
  plugins: [typography, daisyui],
};
