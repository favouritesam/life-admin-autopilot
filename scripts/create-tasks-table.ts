import { Pool } from 'pg'

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'life-admin-autopilot',
  user: 'postgres',
  password: 'chiChi1212$',
})

async function createTasksTable() {
  console.log('Creating tasks table...')

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      dueDate TIMESTAMP NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT NOT NULL DEFAULT 'personal',
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  const createIndexesSQL = `
    CREATE INDEX IF NOT EXISTS tasks_userId_idx ON tasks(userId);
    CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
    CREATE INDEX IF NOT EXISTS tasks_dueDate_idx ON tasks(dueDate);
  `

  try {
    await pool.query(createTableSQL)
    console.log('✅ Tasks table created successfully!')
    
    await pool.query(createIndexesSQL)
    console.log('✅ Indexes created successfully!')
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    // Don't throw error for indexes, table is created
  } finally {
    await pool.end()
  }
}

createTasksTable()
