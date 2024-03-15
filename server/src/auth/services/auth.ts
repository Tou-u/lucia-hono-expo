import { generateId } from 'lucia'
import { and, eq } from 'drizzle-orm'
import {
  GitHub,
  Discord,
  DiscordTokens,
  GitHubTokens,
  Google,
  GoogleTokens,
} from 'arctic'

import { initializeLucia } from '@/lib/lucia'
import { dbConnection } from '@/lib/db'
import { oauthTable, userTable } from '@/user/schema'
import { Provider, UserInfo } from '../interfaces'

export class AuthService {
  private lucia: ReturnType<typeof initializeLucia>
  private drizzle: ReturnType<typeof dbConnection>
  public github: GitHub
  public discord: Discord
  public google: Google

  constructor(private ctx: APIContext) {
    this.lucia = initializeLucia(ctx.env)
    this.drizzle = dbConnection(this.ctx.env.DB)
    this.github = new GitHub(
      ctx.env.GITHUB_CLIENT_ID,
      ctx.env.GITHUB_CLIENT_SECRET
    )
    this.discord = new Discord(
      ctx.env.DISCORD_CLIENT_ID,
      ctx.env.DISCORD_CLIENT_SECRET,
      ctx.env.DISCORD_REDIRECT_URI
    )
    this.google = new Google(
      ctx.env.GOOGLE_CLIENT_ID,
      ctx.env.GOOGLE_CLIENT_SECRET,
      ctx.env.GOOGLE_REDIRECT_URI
    )
  }

  private async checkForExistingUser(userInfo: UserInfo) {
    const existingUser = await this.drizzle
      .select({ id: userTable.id, username: userTable.username })
      .from(oauthTable)
      .where(
        and(
          eq(oauthTable.providerId, userInfo.provider),
          eq(oauthTable.providerUserId, userInfo.id)
        )
      )
      .innerJoin(userTable, eq(userTable.id, oauthTable.userId))
      .get()

    return existingUser
  }

  private async createAccount(userId: string, userInfo: UserInfo) {
    try {
      const [[user], _] = await this.drizzle.batch([
        this.drizzle
          .insert(userTable)
          .values({
            id: userId,
            username: userInfo.username,
            avatar: userInfo.avatar,
          })
          .returning(),
        this.drizzle.insert(oauthTable).values({
          providerId: userInfo.provider,
          providerUserId: userInfo.id,
          userId,
        }),
      ])

      return user
    } catch (error) {
      return { error: 'An unknown error ocurred, try again later.' }
    }
  }

  private async createSession(userId: string) {
    return await this.lucia.createSession(userId, {})
  }

  public async authAccount(userInfo: UserInfo) {
    const existingUser = await this.checkForExistingUser(userInfo)

    if (existingUser) {
      return await this.createSession(existingUser.id)
    }

    const userId = generateId(15)
    const newAccount = await this.createAccount(userId, userInfo)

    if ('error' in newAccount) return { error: newAccount.error }
    return await this.createSession(userId)
  }

  public validateAuthorizationCode(
    code: string,
    provider: Provider,
    codeVerifier?: string
  ): Promise<GitHubTokens | DiscordTokens | GoogleTokens> {
    if (provider === 'google') {
      return this.google.validateAuthorizationCode(code, codeVerifier!)
    }
    return this[provider].validateAuthorizationCode(code)
  }
}
