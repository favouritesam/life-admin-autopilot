'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Task {
  id: number
  title: string
  description?: string
  due_date?: string
  priority: string
  status: string
  category?: string
}

interface TaskTimelineProps {
  tasks: Task[]
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'low':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return '✓'
    case 'in_progress':
      return '◐'
    default:
      return '○'
  }
}

export default function TaskTimeline({ tasks }: TaskTimelineProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Sort tasks by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  })

  // Filter tasks
  const filteredTasks = selectedStatus
    ? sortedTasks.filter((t) => t.status === selectedStatus)
    : sortedTasks

  // Group by month
  const grouped: { [key: string]: Task[] } = {}
  filteredTasks.forEach((task) => {
    const monthKey = task.due_date
      ? new Date(task.due_date).toLocaleString('default', { month: 'long', year: 'numeric' })
      : 'No Date'

    if (!grouped[monthKey]) grouped[monthKey] = []
    grouped[monthKey].push(task)
  })

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setSelectedStatus(null)}
          variant={selectedStatus === null ? 'default' : 'outline'}
          className={selectedStatus === null ? 'bg-primary text-primary-foreground' : ''}
        >
          All
        </Button>
        <Button
          onClick={() => setSelectedStatus('pending')}
          variant={selectedStatus === 'pending' ? 'default' : 'outline'}
          className={selectedStatus === 'pending' ? 'bg-primary text-primary-foreground' : ''}
        >
          Pending
        </Button>
        <Button
          onClick={() => setSelectedStatus('in_progress')}
          variant={selectedStatus === 'in_progress' ? 'default' : 'outline'}
          className={selectedStatus === 'in_progress' ? 'bg-primary text-primary-foreground' : ''}
        >
          In Progress
        </Button>
        <Button
          onClick={() => setSelectedStatus('completed')}
          variant={selectedStatus === 'completed' ? 'default' : 'outline'}
          className={selectedStatus === 'completed' ? 'bg-primary text-primary-foreground' : ''}
        >
          Completed
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([month, monthTasks]) => (
          <div key={month}>
            <h3 className="text-lg font-semibold text-foreground mb-4">{month}</h3>
            <div className="space-y-3">
              {monthTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition ${
                    task.status === 'completed'
                      ? 'bg-muted border-border opacity-75'
                      : 'bg-background border-border hover:border-primary'
                  }`}
                >
                  {/* Status indicator */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {getStatusIcon(task.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            task.status === 'completed'
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {task.due_date && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                      {task.category && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          🏷️ {task.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
