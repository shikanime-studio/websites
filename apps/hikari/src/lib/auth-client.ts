import { createAuthClient } from "better-auth/client";
import { oneTapClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SITE,
  plugins: [
    oneTapClient({ clientId: import.meta.env.VITE_PUBLIC_GOOGLE_CLIENT_ID }),
  ],
});
