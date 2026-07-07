'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface Reminder {
  id: string
  taskTitle: string
  taskId: string
  scheduledTime: Date
  dueDate: Date
  status: 'pending' | 'sent'
  reminderDays: string
  sentAt?: Date
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800 border-green-300'
    default:
      return 'bg-blue-100 text-blue-800 border-blue-300'
  }
}

export default function RemindersPage() {
  const router = useRouter()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all')

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/tasks', {
        credentials: 'include',
      })
      if (response.ok) {
        const tasksData = await response.json()
        // Filter tasks that have reminders
        const tasksWithReminders = tasksData
          .filter((task: any) => task.hasReminder)
          .map((task: any) => ({
            id: task.id.toString(),
            taskId: task.id.toString(),
            taskTitle: task.title,
            scheduledTime: new Date(task.reminderDate),
            dueDate: new Date(task.dueDate),
            status: task.reminderSent ? 'sent' : 'pending',
            reminderDays: task.reminderDays || '1',
          }))
        setReminders(tasksWithReminders)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
      toast.error('Error fetching reminders')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredReminders = filter === 'all'
    ? reminders
    : reminders.filter(r => r.status === filter)

  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ hasReminder: false }),
      })
      if (response.ok) {
        setReminders(reminders.filter(r => r.taskId !== taskId))
        toast.success('Reminder deleted')
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
      toast.error('Error deleting reminder')
    }
  }

  const stats = {
    total: reminders.length,
    pending: reminders.filter(r => r.status === 'pending').length,
    sent: reminders.filter(r => r.status === 'sent').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reminders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Reminders</h1>
            <p className="text-muted-foreground">Manage all your task reminders and notifications</p>
          </div>
          <Link href="/tasks/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap">
              Set New Reminder
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Reminders</div>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground mb-1">Sent</div>
            <div className="text-3xl font-bold text-green-600">{stats.sent}</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
          >
            All Reminders
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'default' : 'outline'}
          >
            Pending ({stats.pending})
          </Button>
          <Button
            onClick={() => setFilter('sent')}
            variant={filter === 'sent' ? 'default' : 'outline'}
          >
            Sent ({stats.sent})
          </Button>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <div className="text-4xl mb-3">🔔</div>
              <p className="text-muted-foreground mb-4">No reminders {filter !== 'all' ? 'in this category' : 'yet'}</p>
              <Link href="/tasks/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Task with Reminder
                </Button>
              </Link>
            </div>
          ) : (
            filteredReminders.map(reminder => (
              <div
                key={reminder.id}
                className={`bg-card rounded-lg border transition-all hover:border-primary/50 p-4 ${
                  reminder.status === 'sent' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reminder.status)}`}>
                    {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold ${
                      reminder.status === 'sent' ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}>
                      {reminder.taskTitle}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>� Task Reminder</span>
                      <span>•</span>
                      <span>
                        {reminder.status === 'sent' 
                          ? `Sent ${new Date(reminder.sentAt || reminder.scheduledTime).toLocaleDateString()}`
                          : `Scheduled ${reminder.scheduledTime.toLocaleDateString()}`
                        }
                      </span>
                      {reminder.status === 'pending' && (() => {
                        const daysUntil = Math.ceil((reminder.scheduledTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        return (
                          <>
                            <span>•</span>
                            <span className="font-medium text-foreground">
                              {daysUntil === 0 ? 'Today' : `${daysUntil} days away`}
                            </span>
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/tasks/${reminder.taskId}`}>
                      <Button variant="outline" size="sm">
                        Edit Task
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reminder.taskId)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
