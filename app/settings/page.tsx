'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import { authClient } from '@/lib/auth-client'

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [settings, setSettings] = useState({
    emailReminders: true,
    pushNotifications: false,
    defaultPriority: 'medium',
    reminderLeadTime: '1',
    timezone: 'UTC',
  })

  useEffect(() => {
    // Fetch user session to get email
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        })
        if (response.ok) {
          const session = await response.json()
          if (session?.user?.email) {
            setUserEmail(session.user.email)
          }
        }
      } catch (error) {
        console.error('Failed to fetch user email:', error)
      }
    }
    fetchUserEmail()
  }, [])

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 800))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      router.push('/sign-in')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/sign-in')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and notifications</p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
            Settings saved successfully
          </div>
        )}

        {/* Account Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>👤</span> Account
          </h2>
          <div className="space-y-4">
            <div className="pb-4 border-b border-border">
              <label className="block text-sm text-muted-foreground mb-2">Email Address</label>
              {isEditingEmail ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your.email@example.com"
                  />
                  <Button
                    onClick={() => setIsEditingEmail(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setIsEditingEmail(false)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-foreground font-medium">{userEmail || 'Loading...'}</p>
                  <Button
                    onClick={() => setIsEditingEmail(true)}
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Your account is secure and protected with industry-standard encryption
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>🔔</span> Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex-1">
                <p className="font-medium text-foreground">Email Reminders</p>
                <p className="text-sm text-muted-foreground mt-1">Receive email notifications for upcoming tasks and reminders</p>
              </div>
              <label className="flex items-center gap-2 ml-4">
                <input
                  type="checkbox"
                  checked={settings.emailReminders}
                  onChange={(e) => handleSettingChange('emailReminders', e.target.checked)}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
              </label>
            </div>

            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex-1">
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground mt-1">Get browser notifications for important updates</p>
              </div>
              <label className="flex items-center gap-2 ml-4">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
              </label>
            </div>

            <div>
              <p className="font-medium text-foreground">Reminder Frequency</p>
              <p className="text-sm text-muted-foreground mb-3 mt-1">How often to send reminders for tasks</p>
              <select
                value={settings.reminderLeadTime}
                onChange={(e) => handleSettingChange('reminderLeadTime', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="0">On the day</option>
                <option value="1">1 day before</option>
                <option value="3">3 days before</option>
                <option value="7">1 week before</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>⚙️</span> Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Default Task Priority
              </label>
              <select
                value={settings.defaultPriority}
                onChange={(e) => handleSettingChange('defaultPriority', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">Used when creating new tasks</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="EST">EST (Eastern Standard Time)</option>
                <option value="CST">CST (Central Standard Time)</option>
                <option value="MST">MST (Mountain Standard Time)</option>
                <option value="PST">PST (Pacific Standard Time)</option>
                <option value="GMT">GMT (Greenwich Mean Time)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">For displaying dates and scheduling reminders</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 rounded-lg border border-destructive/20 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>⚠️</span> Danger Zone
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              These actions cannot be easily undone. Proceed with caution.
            </p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
