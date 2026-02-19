import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { config } from '../server/config'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID || '',
      clientSecret: config.GOOGLE_CLIENT_SECRET || '',
      enabled: !!config.GOOGLE_CLIENT_ID && !!config.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [tanstackStartCookies()],
})
