import type { APIRoute } from 'astro'
import { createAuth } from '../../../lib/auth'
import { createD1Database } from '../../../lib/db'

export const ALL: APIRoute = async (context) => {
  const db = createD1Database()
  const auth = createAuth(db)
  return auth.handler(context.request)
}
