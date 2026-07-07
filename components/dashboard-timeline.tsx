'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800 border-red-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
}

const CATEGORY_ICONS = {
  finance: '💰',
  health: '🏥',
  work: '💼',
  personal: '👤',
  home: '🏠',
  legal: '⚖️',
}

function formatDate(date: Date) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysUntil(date: Date) {
  const today = new Date()
  const diff = date.getTime() - today.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
}

interface DashboardTimelineProps {
  tasks: Task[]
  onToggleTask?: (id: string) => void
  onDeleteTask?: (id: string) => void
}

export default function DashboardTimeline({ tasks = [], onToggleTask, onDeleteTask }: DashboardTimelineProps) {
  const sortedTasks = [...tasks].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-muted-foreground mb-4">No tasks yet</p>
            <Link href="/tasks/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Create your first task
              </Button>
            </Link>
          </div>
        ) : (
          sortedTasks.map(task => (
            <div
              key={task.id}
              className={`bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors ${
                task.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => onToggleTask?.(task.id)}
                  className="mt-1 w-5 h-5 rounded border-border cursor-pointer"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-lg font-semibold ${
                      task.status === 'completed' 
                        ? 'line-through text-muted-foreground' 
                        : 'text-foreground'
                    }`}>
                      {CATEGORY_ICONS[task.category as keyof typeof CATEGORY_ICONS]} {task.title}
                    </h3>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(task.dueDate)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded border ${
                      daysUntil(task.dueDate) <= 0 
                        ? 'bg-red-100 text-red-800 border-red-300' 
                        : daysUntil(task.dueDate) <= 7 
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-green-100 text-green-800 border-green-300'
                    }`}>
                      {daysUntil(task.dueDate) <= 0 
                        ? 'OVERDUE' 
                        : daysUntil(task.dueDate) === 1 
                        ? '1 day left'
                        : `${daysUntil(task.dueDate)} days left`}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded border ${
                      PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/tasks/${task.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTask?.(task.id)}
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
    </div>
  )
}
