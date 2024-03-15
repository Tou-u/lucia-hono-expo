import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { OAuth2RequestError } from 'arctic'

import { isAlreadyAuthenticated } from './middleware'
import { githubProvider, discordProvider, googleProvider } from './providers'
import { AuthService } from './services/auth'
import { SessionService } from './services/session'
import type {
  Provider,
  GitHubResponse,
  UserInfo,
  DiscordResponse,
  GoogleResponse,
} from './interfaces'

const auth = new Hono<{ Bindings: Bindings }>()

auth.use('/login/*', isAlreadyAuthenticated)

async function handleOAuth2Callback(
  ctx: APIContext,
  provider: Provider,
  fetchUserInfo: (accessToken: string) => Promise<UserInfo>,
  storeCodeVerifier?: string
) {
  const authService = new AuthService(ctx)
  const code = ctx.req.query('code')
  const state = ctx.req.query('state')
  const storedState = getCookie(ctx, `${provider}_oauth_state`)

  if (!code || !state || !storedState || state !== storedState) {
    return ctx.json({ error: 'The code passed is incorrect or expired.' }, 400)
  }

  try {
    const tokens = await authService.validateAuthorizationCode(
      code,
      provider,
      storeCodeVerifier
    )

    const userInfoResponse = await fetchUserInfo(tokens.accessToken)
    const session = await authService.authAccount(userInfoResponse)
    if ('error' in session) return ctx.json(session.error)

    return ctx.redirect(
      `${ctx.env.EXPO_REDIRECT_URL}?session_token=${session.id}`
    )
  } catch (error) {
    if (error instanceof OAuth2RequestError) {
      return ctx.json({ error: error.description }, 400)
    }
    return ctx.json(
      { error: 'An unknown error ocurred, try again later.' },
      500
    )
  }
}

auth.get('/login/github', async (ctx) => {
  const github = await githubProvider(ctx)
  return ctx.redirect(github)
})

auth.get('/login/github/callback', async (ctx) => {
  const fetchUserInfo = async (accessToken: string) => {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'request',
      },
    })
    const githubResponse = (await response.json()) as GitHubResponse
    const userInfo: UserInfo = {
      id: githubResponse.id.toString(),
      username: githubResponse.login,
      avatar: githubResponse.avatar_url,
      provider: 'github',
    }
    return userInfo
  }

  return await handleOAuth2Callback(ctx, 'github', fetchUserInfo)
})

auth.get('/login/discord', async (ctx) => {
  const discord = await discordProvider(ctx)
  return ctx.redirect(discord)
})

auth.get('/login/discord/callback', async (ctx) => {
  const fetchUserInfo = async (accessToken: string) => {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'request',
      },
    })
    const discordResponse = (await response.json()) as DiscordResponse
    const userInfo: UserInfo = {
      id: discordResponse.id,
      username: discordResponse.global_name,
      avatar: `https://cdn.discordapp.com/avatars/${discordResponse.id}/${discordResponse.avatar}`,
      provider: 'discord',
    }
    return userInfo
  }

  return await handleOAuth2Callback(ctx, 'discord', fetchUserInfo)
})

auth.get('/login/google', async (ctx) => {
  const google = await googleProvider(ctx)
  return ctx.redirect(google)
})

auth.get('/login/google/callback', async (ctx) => {
  const storedCodeVerifier = getCookie(ctx, `code_verifier`)
  if (!storedCodeVerifier) {
    return ctx.json({ error: 'The code passed is incorrect or expired.' }, 400)
  }

  const fetchUserInfo = async (accessToken: string) => {
    const response = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'request',
        },
      }
    )
    const googleResponse = (await response.json()) as GoogleResponse
    const userInfo: UserInfo = {
      id: googleResponse.sub,
      username: googleResponse.given_name,
      avatar: googleResponse.picture,
      provider: 'google',
    }
    return userInfo
  }

  return await handleOAuth2Callback(
    ctx,
    'google',
    fetchUserInfo,
    storedCodeVerifier
  )
})

auth.get('/me', async (ctx) => {
  const sessionService = new SessionService(ctx)
  const { user } = await sessionService.validateSession(ctx)
  return ctx.json(user)
})

auth.post('/logout', async (ctx) => {
  const sessionService = new SessionService(ctx)
  const logout = await sessionService.logout(ctx)
  return ctx.json(logout)
})

export { auth }
