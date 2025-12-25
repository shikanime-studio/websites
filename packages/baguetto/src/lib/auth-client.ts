import { createAuthClient } from "better-auth/client";
import { oneTapClient } from "better-auth/client/plugins";

const googleClientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;

export const authClient = createAuthClient({
  plugins: googleClientId ? [oneTapClient({ clientId: googleClientId })] : [],
});
