import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tasks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

// GET /api/tasks - Fetch all tasks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, session.user.id))
      .orderBy(tasks.dueDate)

    return NextResponse.json(userTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, dueDate, priority, category, hasReminder, reminderDays } = body

    if (!title || !dueDate) {
      return NextResponse.json({ error: 'Title and dueDate are required' }, { status: 400 })
    }

    // Calculate reminder date if reminder is set
    let reminderDate = null
    if (hasReminder && reminderDays) {
      const due = new Date(dueDate)
      const daysBefore = parseInt(reminderDays)
      reminderDate = new Date(due.getTime() - (daysBefore * 24 * 60 * 60 * 1000))
    }

    const newTask = await db
      .insert(tasks)
      .values({
        userId: session.user.id,
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || 'medium',
        category: category || 'personal',
        status: 'pending',
        hasReminder: hasReminder || false,
        reminderDays: reminderDays || '1',
        reminderDate,
        reminderSent: false,
      })
      .returning()

    return NextResponse.json(newTask[0], { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
