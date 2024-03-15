import { generateState } from 'arctic'
import { serializeCookie } from 'oslo/cookie'

import { AuthService } from '../services/auth'

async function githubProvider(ctx: APIContext): Promise<string> {
  const authService = new AuthService(ctx)
  const state = generateState()

  const url = await authService.github.createAuthorizationURL(state)

  ctx.header(
    'Set-Cookie',
    serializeCookie('github_oauth_state', state, {
      path: '/',
      maxAge: 60 * 10,
      httpOnly: true,
      secure: ctx.env.ENVIRONMENT !== 'DEV',
    })
  )

  return url.toString()
}

export { githubProvider }
