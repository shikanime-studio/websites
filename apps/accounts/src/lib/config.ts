// The app is single-tenant: one canonical origin and one Google client.
// Workers builds do not inject Vite variables, so these literals keep the
// deployed bundle correct; local development can still override them.
export const SITE
  = import.meta.env.VITE_SITE
    ?? (import.meta.env.DEV
      ? "http://localhost:3101"
      : "https://accounts.shikanime.studio");

export const GOOGLE_CLIENT_ID
  = import.meta.env.VITE_PUBLIC_GOOGLE_CLIENT_ID
    ?? "822479462122-o330keuviu3urhc4mvfq7k64oo9doser.apps.googleusercontent.com";
