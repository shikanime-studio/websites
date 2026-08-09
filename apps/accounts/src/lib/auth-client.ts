import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { createAuthClient } from "better-auth/client";
import { oneTapClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    oneTapClient({ clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID }),
    oauthProviderClient(),
  ],
});
