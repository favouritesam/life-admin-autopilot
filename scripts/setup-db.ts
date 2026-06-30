import { Pool } from 'pg'

// Use local PostgreSQL - update these values to match your setup
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Connect to default postgres database first
  user: 'postgres',
  password: 'chiChi1212$',
})

async function setupDatabase() {
  console.log('Creating life-admin-autopilot database...')

  // Create the database
  try {
    await pool.query(`CREATE DATABASE "life-admin-autopilot"`)
    console.log('✅ Database created successfully!')
  } catch (error: any) {
    if (error.code === '42P04') {
      console.log('ℹ️  Database already exists, skipping creation')
    } else {
      throw error
    }
  }

  // Close the connection to postgres and connect to the new database
  await pool.end()

  const newPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'life-admin-autopilot',
    user: 'postgres',
    password: 'chiChi1212$',
  })

  console.log('Setting up Better Auth tables...')

  const createTables = `
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
      "image" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMP NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMP,
      "refreshTokenExpiresAt" TIMESTAMP,
      "scope" TEXT,
      "password" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");
    CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
    CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");
    CREATE INDEX IF NOT EXISTS "verification_expiresAt_idx" ON "verification"("expiresAt");
  `

  try {
    await newPool.query(createTables)
    console.log('✅ Better Auth tables created successfully!')
  } catch (error) {
    console.error('❌ Error creating Better Auth tables:', error)
    throw error
  }

  console.log('Setting up Tasks table...')

  // Drop existing tasks table if it exists to recreate with correct schema
  try {
    await newPool.query(`DROP TABLE IF EXISTS "tasks" CASCADE`)
    console.log('ℹ️  Dropped existing tasks table to recreate with correct schema')
  } catch (error) {
    console.log('ℹ️  No existing tasks table to drop')
  }

  const createTasksTable = `
    CREATE TABLE "tasks" (
      "id" SERIAL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "dueDate" TIMESTAMP NOT NULL,
      "priority" TEXT NOT NULL DEFAULT 'medium',
      "category" TEXT NOT NULL DEFAULT 'personal',
      "status" TEXT NOT NULL DEFAULT 'pending',
      "hasReminder" BOOLEAN NOT NULL DEFAULT FALSE,
      "reminderDays" TEXT DEFAULT '1',
      "reminderDate" TIMESTAMP,
      "reminderSent" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");
    CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");
  `

  try {
    await newPool.query(createTasksTable)
    console.log('✅ Tasks table created successfully!')
  } catch (error) {
    console.error('❌ Error creating tasks table:', error)
    throw error
  } finally {
    await newPool.end()
  }
}

setupDatabase()
