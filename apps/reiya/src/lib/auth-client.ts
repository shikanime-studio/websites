import { createAuthClient } from "better-auth/client";
import { genericOAuthClient, oneTapClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    oneTapClient({ clientId: import.meta.env.PUBLIC_GOOGLE_CLIENT_ID }),
    genericOAuthClient(),
  ],
});
