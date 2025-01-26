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
        newfuture: {
          primary: "#f5712c",
          secondary: "#58c7f3",
          accent: "#ffd200",
          neutral: "#f5f5f5",
          "base-100": "#f5f5f5",
          info: "#53c0f3",
          "info-content": "#140502",
          success: "#71ead2",
          "success-content": "#140502",
          warning: "#eace6c",
          "warning-content": "#140502",
          error: "#ec8c78",
          "error-content": "#140502",
        },
      },
    ],
  },
  plugins: [typography, daisyui],
};
