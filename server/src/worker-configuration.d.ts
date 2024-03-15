import { Context } from 'hono'

declare global {
  type Bindings = {
    DB: D1Database
    ENVIRONMENT: string
    EXPO_REDIRECT_URL: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    DISCORD_CLIENT_ID: string
    DISCORD_CLIENT_SECRET: string
    DISCORD_REDIRECT_URI: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GOOGLE_REDIRECT_URI: string
  }

  export type APIContext = Context<{
    Bindings: Bindings
  }>
}

export default global
