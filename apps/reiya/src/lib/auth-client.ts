import { createAuthClient } from "better-auth/client";
import { SITE } from "./config";

export const authClient = createAuthClient({ baseURL: SITE });
