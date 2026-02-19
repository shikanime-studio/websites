import * as process from 'node:process'
import { z } from 'zod'

const envSchema = z.object({
  MISTRAL_API_KEY: z.string().min(1, 'MISTRAL_API_KEY is required'),
  VITE_GOOGLE_MAPS_API_KEY: z.string().min(1, 'VITE_GOOGLE_MAPS_API_KEY is required'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

export const config = envSchema.parse(process.env)
