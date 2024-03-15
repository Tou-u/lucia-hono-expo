import type { User, Session } from 'lucia'
import { initializeLucia } from '@/lib/lucia'

export class SessionService {
  private lucia: ReturnType<typeof initializeLucia>

  constructor(private ctx: APIContext) {
    this.lucia = initializeLucia(this.ctx.env)
  }

  private async validateAndGetSession(ctx: APIContext): Promise<{
    user: User | null
    session: Session | null
  }> {
    const authorizationHeader = ctx.req.header('Authorization')
    const sessionId = this.lucia.readBearerToken(authorizationHeader ?? '')

    if (!sessionId) return { user: null, session: null }
    const { user, session } = await this.lucia.validateSession(sessionId)
    return { user, session }
  }

  private async invalidateCurrentSession(ctx: APIContext) {
    const { session } = await this.validateAndGetSession(ctx)
    if (!session) return null

    await this.lucia.invalidateSession(session.id)
    return true
  }

  private async getAllSessions(ctx: APIContext) {
    const { user } = await this.validateAndGetSession(ctx)
    if (!user) return null

    return await this.lucia.getUserSessions(user.id)
  }

  private async invalidateAllSessions(ctx: APIContext) {
    const { user } = await this.validateAndGetSession(ctx)
    if (!user) return null

    await this.lucia.invalidateUserSessions(user.id)
    return true
  }

  public async validateSession(ctx: APIContext) {
    return this.validateAndGetSession(ctx)
  }

  public async logout(ctx: APIContext) {
    return this.invalidateCurrentSession(ctx)
  }
}
