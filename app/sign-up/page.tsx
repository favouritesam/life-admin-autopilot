import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import AuthForm from '@/components/auth-form'

export default async function SignUp() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold">LA</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Join Life Admin</h1>
          <p className="text-muted-foreground mt-2">Start managing your life events today</p>
        </div>

        <AuthForm mode="sign-up" />
      </div>
    </div>
  )
}
