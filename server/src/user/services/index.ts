import { initializeLucia } from '@/lib/lucia'
import { dbConnection } from '@/lib/db'

export class UserService {
  private lucia: ReturnType<typeof initializeLucia>
  private drizzle: ReturnType<typeof dbConnection>

  constructor(private ctx: APIContext) {
    this.lucia = initializeLucia(this.ctx.env)
    this.drizzle = dbConnection(this.ctx.env.DB)
  }
}
