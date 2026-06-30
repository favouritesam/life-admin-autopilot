import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

export async function GET() {
  try {
    console.log('[v0] Testing database connection...')
    
    // Try to query users
    const users = await db.select().from(user).limit(1)
    console.log('[v0] Database query successful, found', users.length, 'users')
    
    return Response.json({
      success: true,
      message: 'Database connection working',
      usersCount: users.length,
    })
  } catch (error) {
    console.error('[v0] Database error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
