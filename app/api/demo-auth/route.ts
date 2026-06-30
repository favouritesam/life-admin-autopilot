// Simple demo authentication for testing
// In production, use Better Auth with proper database setup

const DEMO_USERS: Record<string, { name: string; email: string; password: string }> = {}

export async function POST(request: Request) {
  const { action, email, password, name } = await request.json()

  try {
    if (action === 'sign-up') {
      if (DEMO_USERS[email]) {
        return Response.json(
          { error: 'Email already registered' },
          { status: 400 }
        )
      }

      DEMO_USERS[email] = { email, password, name }

      return Response.json({
        success: true,
        message: 'Account created successfully',
        user: { email, name },
      })
    }

    if (action === 'sign-in') {
      const user = DEMO_USERS[email]
      if (!user || user.password !== password) {
        return Response.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      return Response.json({
        success: true,
        message: 'Signed in successfully',
        user: { email: user.email, name: user.name },
      })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return Response.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
