import type { APIRoute } from 'astro'
import { createAuth } from '../../../lib/auth'
import { createD1Database } from '../../../lib/db'

export const ALL: APIRoute = async (context) => {
  const db = createD1Database(context.locals)
  const auth = createAuth(db, context.locals)
  return auth.handler(context.request)
}
