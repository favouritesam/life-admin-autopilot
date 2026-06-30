import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'life-admin-autopilot',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'chiChi1212$',
})

export const db = drizzle(pool, { schema })
