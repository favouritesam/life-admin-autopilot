'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import DashboardTimeline from '@/components/dashboard-timeline'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TaskReminder } from '@/components/task-reminder'

interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
}

export default function TasksPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [alarmingTaskIds, setAlarmingTaskIds] = useState<string[]>([])

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        credentials: 'include',
      })
      if (response.ok) {
        const tasksData = await response.json()
        setTasks(tasksData.map((task: any) => ({
          id: task.id.toString(),
          title: task.title,
          description: task.description,
          dueDate: new Date(task.dueDate),
          priority: task.priority,
          category: task.category,
          status: task.status,
        })))
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const newStatus = task.status === 'completed' ? 'pending' : 'completed'

    // Optimistic update
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, status: newStatus } : t
    ))

    // Save to API
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        // Revert on error
        setTasks(tasks.map(t =>
          t.id === id ? { ...t, status: task.status } : t
        ))
        toast.error('Failed to update task')
      } else {
        toast.success('Task updated')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert on error
      setTasks(tasks.map(t =>
        t.id === id ? { ...t, status: task.status } : t
      ))
      toast.error('Error updating task')
    }
  }

  const deleteTask = async (id: string) => {
    setTaskToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return

    setIsDeleteModalOpen(false)

    toast.promise(
      (async () => {
        // Delete from API
        const response = await fetch(`/api/tasks/${taskToDelete}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to delete task')
        }

        // Optimistic update on success
        setTasks(tasks.filter(t => t.id !== taskToDelete))
        setTaskToDelete(null)
        return true
      })(),
      {
        loading: 'Deleting task...',
        success: 'Task deleted',
        error: 'Failed to delete task',
      }
    )
  }

  const cancelDelete = () => {
    setIsDeleteModalOpen(false)
    setTaskToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
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
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Tasks</h1>
            <p className="text-muted-foreground">All your life events and deadlines organized</p>
          </div>
          <Link href="/tasks/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap">
              Add New Task
            </Button>
          </Link>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'default' : 'outline'}
          >
            List View
          </Button>
          <Button
            onClick={() => setViewMode('calendar')}
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
          >
            Calendar View
          </Button>
        </div>

        {/* Tasks Timeline */}
        <div className="bg-card rounded-lg border border-border p-6">
          {viewMode === 'list' ? (
            <DashboardTimeline tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} alarmingTaskIds={alarmingTaskIds} />
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Calendar View</h3>
              <p className="text-muted-foreground mb-4">Calendar view coming soon!</p>
              <p className="text-sm text-muted-foreground">For now, use the list view to see all your tasks organized by date.</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Task Reminder - plays beep for tasks due within 24 hours */}
      <TaskReminder tasks={tasks} onAlarmingTasksChange={setAlarmingTaskIds} />
    </div>
  )


}
