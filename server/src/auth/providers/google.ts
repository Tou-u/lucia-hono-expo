import { generateCodeVerifier, generateState } from 'arctic'
import { serializeCookie } from 'oslo/cookie'

import { AuthService } from '../services/auth'

async function googleProvider(ctx: APIContext): Promise<string> {
  const authService = new AuthService(ctx)
  const state = generateState()
  const codeVerifier = generateCodeVerifier()

  const url = await authService.google.createAuthorizationURL(
    state,
    codeVerifier,
    {
      scopes: ['profile', 'email'],
    }
  )

  ctx.header(
    'Set-Cookie',
    serializeCookie('google_oauth_state', state, {
      path: '/',
      maxAge: 60 * 10,
      httpOnly: true,
      secure: ctx.env.ENVIRONMENT !== 'DEV',
    }),
    { append: true }
  )

  ctx.header(
    'Set-Cookie',
    serializeCookie('code_verifier', codeVerifier, {
      path: '/',
      maxAge: 60 * 10,
      httpOnly: true,
      secure: ctx.env.ENVIRONMENT !== 'DEV',
    }),
    { append: true }
  )

  return url.toString()
}

export { googleProvider }
