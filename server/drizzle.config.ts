import type { Config } from 'drizzle-kit'
import path from 'path'

const { LOCAL_DB_PATH } = process.env

export default LOCAL_DB_PATH
  ? ({
      schema: './src/*/schema/index.ts',
      out: './drizzle/migrations',
      driver: 'better-sqlite',
      dbCredentials: {
        url: LOCAL_DB_PATH,
      },
    } satisfies Config)
  : ({
      schema: './src/*/schema/index.ts',
      out: './drizzle/migrations',
      driver: 'd1',
      dbCredentials: {
        wranglerConfigPath: path.resolve(__dirname, 'wrangler.toml'),
        dbName: 'lucia',
      },
    } satisfies Config)
