import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { auth } from './auth'
import { initializeLucia } from '@/lib/lucia'

const app = new Hono<{ Bindings: Bindings }>()

// app.use(async (ctx, next) => {
//   await cors({ origin: ctx.env.FRONTEND_URL, credentials: true })(ctx, next)
// })

// app.use(cors())

app.get('/', (c) => {
  return c.json({message: 'Hello from Hono!'})
})

app.route('/auth', auth)

// Cron-Job that deletes all expired sessions
export default {
  fetch: app.fetch,
  scheduled: async (_: ScheduledEvent, env: Bindings) => {
    const lucia = initializeLucia(env)
    return await lucia.deleteExpiredSessions()
  },
}
