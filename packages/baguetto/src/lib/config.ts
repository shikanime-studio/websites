import z from "zod";

const googleConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  authorizedRedirectBaseUri: z.string(),
});

export function getGoogleConfig() {
  return googleConfigSchema.parse({
    clientId: import.meta.env.GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    authorizedRedirectBaseUri: import.meta.env
      .GOOGLE_AUTHORIZED_REDIRECT_BASE_URI,
  });
}
