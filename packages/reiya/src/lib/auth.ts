import DiscordProvider from "next-auth/providers/discord";
import type { NextAuthOptions } from "next-auth";
import { HasuraAdapter } from "@auth/hasura-adapter";

export default {
  adapter: HasuraAdapter({
    endpoint: process.env.HASURA_PROJECT_ENDPOINT!,
    adminSecret: process.env.HASURA_ADMIN_SECRET!,
  }),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
} as NextAuthOptions;
