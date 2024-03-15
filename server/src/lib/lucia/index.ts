import { Lucia } from 'lucia'
import { D1Adapter } from '@lucia-auth/adapter-sqlite'

export function initializeLucia(env: Bindings) {
  const adapter = new D1Adapter(env.DB, {
    user: 'user',
    session: 'session',
  })
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: env.ENVIRONMENT !== 'DEV',
      },
    },
    getUserAttributes: (attributes) => {
      return {
        username: attributes.username,
        avatar: attributes.avatar,
      }
    },
  })
}

declare module 'lucia' {
  interface Register {
    Auth: ReturnType<typeof initializeLucia>
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

interface DatabaseUserAttributes {
  username: string
  avatar?: string
}
