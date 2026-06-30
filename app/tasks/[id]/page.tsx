'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'

const CATEGORIES = [
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'legal', label: 'Legal', icon: '⚖️' },
]

interface Task {
  id: string
  title: string
  description?: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
}

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchTask()
  }, [taskId])

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true)
        } else {
          setError('Failed to fetch task')
        }
        return
      }

      const task: Task = await response.json()
      setTitle(task.title)
      setDescription(task.description || '')
      setDueDate(new Date(task.dueDate).toISOString().split('T')[0])
      setPriority(task.priority)
      setCategory(task.category)
    } catch (err) {
      setError('Error loading task. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          priority,
          category,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Error updating task. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading task...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Task Not Found</h1>
            <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => router.push('/dashboard')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Task</h1>
          <p className="text-muted-foreground">Update the details of your task</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Section */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Task Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Task Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Pay monthly rent"
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add additional details, notes, or context about this task..."
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Date & Priority Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">When</h2>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Due Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Priority</h2>
              
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p as 'low' | 'medium' | 'high')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      priority === p
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                    disabled={isSaving}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Category</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border transition-colors text-center ${
                    category === cat.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  disabled={isSaving}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium text-foreground">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!title.trim() || !dueDate || isSaving}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 h-auto"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
