import { drizzle } from 'drizzle-orm/d1'
import * as userSchema from '@/user/schema'

const schema = { userSchema }

export function dbConnection(D1: D1Database) {
  return drizzle(D1, { schema })
}
