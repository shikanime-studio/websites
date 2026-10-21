// The app is single-tenant: one canonical origin and one Google client.
// Workers builds do not inject Vite variables, so these literals keep the
// deployed bundle correct; local development can still override them.
export const SITE = import.meta.env.VITE_SITE ?? "https://accounts.shikanime.studio";

export const GOOGLE_CLIENT_ID
  = import.meta.env.VITE_PUBLIC_GOOGLE_CLIENT_ID
    ?? "978776659802-e1ltf0b87jfmifqm8vfr2mi79vus7g8u.apps.googleusercontent.com";
