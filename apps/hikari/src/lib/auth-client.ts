import { createAuthClient } from "better-auth/client";
import { oneTapClient } from "better-auth/client/plugins";
import { GOOGLE_CLIENT_ID, SITE } from "./config";

export const authClient = createAuthClient({
  baseURL: SITE,
  plugins: [
    oneTapClient({ clientId: GOOGLE_CLIENT_ID }),
  ],
});
