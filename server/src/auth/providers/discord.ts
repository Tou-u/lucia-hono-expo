import { generateState } from 'arctic'
import { serializeCookie } from 'oslo/cookie'

import { AuthService } from '../services/auth'

async function discordProvider(ctx: APIContext): Promise<string> {
  const authService = new AuthService(ctx)
  const state = generateState()

  const url = await authService.discord.createAuthorizationURL(state, {
    scopes: ['identify'],
  })

  ctx.header(
    'Set-Cookie',
    serializeCookie('discord_oauth_state', state, {
      path: '/',
      maxAge: 60 * 10,
      httpOnly: true,
      secure: ctx.env.ENVIRONMENT !== 'DEV',
    })
  )

  return url.toString()
}

export { discordProvider }
