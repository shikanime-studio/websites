// Workers builds do not inject Vite variables, so the deployed bundle needs
// canonical fallbacks. Local development can still override them in `.env`.
export const SITE
  = import.meta.env.VITE_SITE
    ?? (import.meta.env.DEV
      ? "http://localhost:5173"
      : "https://hikari.shikanime.studio");

export const GOOGLE_CLIENT_ID
  = import.meta.env.VITE_PUBLIC_GOOGLE_CLIENT_ID
    ?? "822479462122-ljet576v96iqgknrm813cf2qpg65sbiv.apps.googleusercontent.com";
