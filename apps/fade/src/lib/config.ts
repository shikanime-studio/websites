// Workers builds do not inject Vite variables, so the deployed bundle needs
// canonical fallbacks. Local development can still override them in `.env`.
export const SITE
  = import.meta.env.VITE_SITE
    ?? (import.meta.env.DEV
      ? "http://localhost:3000"
      : "https://fade.shikanime.studio");

export const ACCOUNTS_SITE
  = import.meta.env.VITE_ACCOUNTS_SITE
    ?? (import.meta.env.DEV
      ? "http://localhost:3101"
      : "https://accounts.shikanime.studio");

export const CALLBACK_PATH = "/api/studio/callback";

export const SESSION_COOKIE = "fade_studio";
