'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Navigation() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/sign-in')
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">LA</span>
            </div>
            <span className="hidden sm:inline font-bold text-foreground">Life Admin</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground hover:text-primary transition">
              Dashboard
            </Link>
            <Link href="/tasks" className="text-foreground hover:text-primary transition">
              Tasks
            </Link>
            <Link href="/reminders" className="text-foreground hover:text-primary transition">
              Reminders
            </Link>
            <Link href="/settings" className="text-foreground hover:text-primary transition">
              Settings
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col gap-1.5 w-6 h-6"
          >
            <span className="w-full h-0.5 bg-foreground rounded"></span>
            <span className="w-full h-0.5 bg-foreground rounded"></span>
            <span className="w-full h-0.5 bg-foreground rounded"></span>
          </button>

          {/* Logout Button */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="hidden sm:block text-foreground hover:bg-muted"
          >
            Sign out
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <Link
              href="/"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded"
            >
              Dashboard
            </Link>
            <Link
              href="/tasks"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded"
            >
              Tasks
            </Link>
            <Link
              href="/reminders"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded"
            >
              Reminders
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded"
            >
              Settings
            </Link>
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full mt-2 text-foreground hover:bg-muted"
            >
              Sign out
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
