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
  plugins: [typography, daisyui],
};
