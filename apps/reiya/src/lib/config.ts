// Workers builds do not inject Vite variables, so the deployed bundle needs
// canonical fallbacks. Local development can still override them in `.env`.
export const SITE
  = import.meta.env.VITE_SITE
    ?? (import.meta.env.DEV
      ? "http://localhost:5173"
      : "https://reiya.shikanime.studio");

export const GOOGLE_CLIENT_ID
  = import.meta.env.VITE_PUBLIC_GOOGLE_CLIENT_ID
    ?? "978776659802-e1ltf0b87jfmifqm8vfr2mi79vus7g8u.apps.googleusercontent.com";
