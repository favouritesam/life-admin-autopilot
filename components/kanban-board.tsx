'use client'

import { useState } from 'react'
import { Plus, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
}

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick?: (taskId: string) => void
  onStatusChange?: (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => void
}

type ColumnType = 'pending' | 'in_progress' | 'completed'

const COLUMNS = [
  { id: 'pending' as ColumnType, title: 'To Do', color: 'border-blue-500' },
  { id: 'in_progress' as ColumnType, title: 'In Progress', color: 'border-yellow-500' },
  { id: 'completed' as ColumnType, title: 'Done', color: 'border-green-500' },
]

export function KanbanBoard({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const getTasksByStatus = (status: ColumnType) => {
    return tasks.filter(task => {
      if (status === 'completed') return task.status === 'completed'
      if (status === 'in_progress') return task.status === 'pending' && task.priority === 'high'
      return task.status === 'pending' && task.priority !== 'high'
    })
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: ColumnType) => {
    if (draggedTask && onStatusChange) {
      const newStatus = status === 'completed' ? 'completed' : 'pending'
      onStatusChange(draggedTask.id, newStatus)
    }
    setDraggedTask(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map(column => {
        const columnTasks = getTasksByStatus(column.id)

        return (
          <div
            key={column.id}
            className="bg-card rounded-lg border border-border p-4 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color.replace('border-', 'bg-')}`} />
                {column.title}
              </h3>
              <Badge variant="secondary">{columnTasks.length}</Badge>
            </div>

            <div className="space-y-3">
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onClick={() => onTaskClick?.(task.id)}
                  className="bg-background rounded-lg border border-border p-4 cursor-move hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
