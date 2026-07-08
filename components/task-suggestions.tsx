'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
  createdAt?: Date
}

interface TaskSuggestionsProps {
  tasks: Task[]
  onSuggestionClick?: (suggestion: Partial<Task>) => void
}

export function TaskSuggestions({ tasks, onSuggestionClick }: TaskSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    generateSuggestions()
  }, [tasks])

  const generateSuggestions = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const pendingTasks = tasks.filter(t => t.status === 'pending')

    const newSuggestions: string[] = []

    // Analyze patterns from completed tasks
    const categoryCounts: Record<string, number> = {}
    completedTasks.forEach(task => {
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1
    })

    // Suggest tasks based on most active categories
    const mostActiveCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0]

    if (mostActiveCategory) {
      const [category, count] = mostActiveCategory
      if (count >= 3) {
        newSuggestions.push(`Continue working on ${category} tasks (you've completed ${count} recently)`)
      }
    }

    // Suggest recurring tasks based on patterns
    const taskTitles = completedTasks.map(t => t.title.toLowerCase())
    const recurringPatterns = [
      { pattern: 'pay', suggestion: 'Pay bills' },
      { pattern: 'meeting', suggestion: 'Schedule meeting' },
      { pattern: 'report', suggestion: 'Prepare report' },
      { pattern: 'review', suggestion: 'Review documents' },
      { pattern: 'call', suggestion: 'Make important calls' },
      { pattern: 'email', suggestion: 'Respond to emails' },
    ]

    recurringPatterns.forEach(({ pattern, suggestion }) => {
      if (taskTitles.some(title => title.includes(pattern))) {
        newSuggestions.push(suggestion)
      }
    })

    // Suggest based on overdue or urgent tasks
    const overdueTasks = pendingTasks.filter(t => new Date(t.dueDate) < new Date())
    if (overdueTasks.length > 0) {
      newSuggestions.push(`Focus on ${overdueTasks.length} overdue task(s)`)
    }

    // Suggest based on high priority tasks
    const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high')
    if (highPriorityTasks.length > 0) {
      newSuggestions.push(`Tackle ${highPriorityTasks.length} high priority task(s)`)
    }

    // Suggest based on category balance
    const categoryBalance = new Set(pendingTasks.map(t => t.category)).size
    if (categoryBalance < 3 && pendingTasks.length > 0) {
      newSuggestions.push('Add tasks from different categories for better balance')
    }

    // General productivity suggestions
    if (pendingTasks.length > 10) {
      newSuggestions.push('Consider breaking down large tasks into smaller subtasks')
    }

    if (completedTasks.length > 0 && pendingTasks.length === 0) {
      newSuggestions.push('Great job! All tasks completed. Consider planning ahead.')
    }

    setSuggestions(newSuggestions.slice(0, 5)) // Limit to 5 suggestions
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">AI Suggestions</h2>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
            <p className="text-sm text-foreground">{suggestion}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
