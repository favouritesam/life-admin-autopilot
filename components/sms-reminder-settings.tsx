'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Check } from 'lucide-react'

interface SMSReminderSettingsProps {
  onSave?: (settings: SMSSettings) => void
}

interface SMSSettings {
  phoneNumber: string
  enabled: boolean
  reminderTimes: number[] // hours before due date
}

export function SMSReminderSettings({ onSave }: SMSReminderSettingsProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [reminderTimes, setReminderTimes] = useState<number[]>([24, 72]) // 1 day, 3 days
  const [isSaving, setIsSaving] = useState(false)

  const availableTimes = [
    { label: '1 hour', value: 1 },
    { label: '3 hours', value: 3 },
    { label: '6 hours', value: 6 },
    { label: '12 hours', value: 12 },
    { label: '1 day', value: 24 },
    { label: '2 days', value: 48 },
    { label: '3 days', value: 72 },
    { label: '1 week', value: 168 },
  ]

  const toggleReminderTime = (hours: number) => {
    if (reminderTimes.includes(hours)) {
      setReminderTimes(reminderTimes.filter(t => t !== hours))
    } else {
      setReminderTimes([...reminderTimes, hours])
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const settings: SMSSettings = { phoneNumber, enabled, reminderTimes }
      
      // Save to API
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsReminders: settings }),
        credentials: 'include',
      })

      if (response.ok) {
        onSave?.(settings)
      }
    } catch (error) {
      console.error('Error saving SMS settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SMS Reminders
        </CardTitle>
        <CardDescription>
          Get text message notifications before your tasks are due
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
            disabled={!enabled}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enabled"
            checked={enabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <Label htmlFor="enabled">Enable SMS reminders</Label>
        </div>

        {enabled && (
          <div className="space-y-2">
            <Label>Reminder Times</Label>
            <div className="flex flex-wrap gap-2">
              {availableTimes.map((time) => (
                <button
                  key={time.value}
                  onClick={() => toggleReminderTime(time.value)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    reminderTimes.includes(time.value)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary/50'
                  }`}
                >
                  {reminderTimes.includes(time.value) && (
                    <Check className="inline h-3 w-3 mr-1" />
                  )}
                  {time.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  )
}
