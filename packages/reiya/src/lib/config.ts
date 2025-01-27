import z from "zod";

const googleConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export function getGoogleConfig() {
  return googleConfigSchema.parse(import.meta.env);
}
