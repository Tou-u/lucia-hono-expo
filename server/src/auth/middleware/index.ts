import { MiddlewareHandler } from 'hono'
import { SessionService } from '../services/session'

export const isAlreadyAuthenticated: MiddlewareHandler = async (ctx, next) => {
  const sessionService = new SessionService(ctx)
  const { user } = await sessionService.validateSession(ctx)

  if (user) {
    return ctx.json({ error: 'Already logged in.' }, 401)
  }

  await next()
}
