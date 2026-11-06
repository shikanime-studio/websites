// Workers builds do not inject Vite variables, so the deployed bundle needs
// canonical fallbacks. Local development can still override them in `.env`.
export const SITE =
  // eslint-disable-next-line dot-notation -- strictest TS4111 demands brackets
  import.meta.env["VITE_SITE"] ??
  (import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://transfert.shikanime.studio");

export const ACCOUNTS_SITE =
  // eslint-disable-next-line dot-notation -- strictest TS4111 demands brackets
  import.meta.env["VITE_ACCOUNTS_SITE"] ??
  (import.meta.env.DEV
    ? "http://localhost:3101"
    : "https://accounts.shikanime.studio");
