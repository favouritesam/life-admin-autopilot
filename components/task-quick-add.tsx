'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
  hasReminder?: boolean
  reminderDays?: string
}

interface TaskQuickAddProps {
  onTaskCreate?: (task: Task) => void
}

export default function TaskQuickAdd({ onTaskCreate }: TaskQuickAddProps) {
  const [inputMode, setInputMode] = useState<'ai' | 'form'>('ai')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasReminder, setHasReminder] = useState(false)
  const [reminderDays, setReminderDays] = useState('1')

  const parseTaskFromInput = (text: string): Omit<Task, 'id' | 'status'> => {
    const lowerText = text.toLowerCase()
    
    // Default values
    let title = text
    let priority: 'high' | 'medium' | 'low' = 'medium'
    let category = 'personal'
    let dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7) // Default to 1 week from now

    // Extract priority
    if (lowerText.includes('urgent') || lowerText.includes('important') || lowerText.includes('asap')) {
      priority = 'high'
    } else if (lowerText.includes('low') || lowerText.includes('whenever')) {
      priority = 'low'
    }

    // Extract category
    if (lowerText.includes('bill') || lowerText.includes('rent') || lowerText.includes('payment') || lowerText.includes('money')) {
      category = 'finance'
    } else if (lowerText.includes('doctor') || lowerText.includes('medical') || lowerText.includes('health') || lowerText.includes('appointment')) {
      category = 'health'
    } else if (lowerText.includes('license') || lowerText.includes('renew') || lowerText.includes('legal')) {
      category = 'legal'
    } else if (lowerText.includes('home') || lowerText.includes('house') || lowerText.includes('repair') || lowerText.includes('maintenance')) {
      category = 'home'
    } else if (lowerText.includes('work') || lowerText.includes('meeting') || lowerText.includes('office')) {
      category = 'work'
    }

    // Extract date (simple parsing)
    const dateMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)
    if (dateMatch) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      const monthIndex = monthNames.findIndex(m => dateMatch[0].toLowerCase().includes(m))
      if (monthIndex !== -1) {
        dueDate = new Date(new Date().getFullYear(), monthIndex, parseInt(dateMatch[1]))
      }
    } else if (lowerText.includes('tomorrow')) {
      dueDate.setDate(dueDate.getDate() + 1)
    } else if (lowerText.includes('today')) {
      dueDate = new Date()
    } else if (lowerText.includes('next week')) {
      dueDate.setDate(dueDate.getDate() + 7)
    } else if (lowerText.includes('next month')) {
      dueDate.setMonth(dueDate.getMonth() + 1)
    }

    return { title, description: text, dueDate, priority, category }
  }

  const handleAIInput = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    
    // Parse task from input
    const parsedTask = parseTaskFromInput(input)
    
    // Create task with ID
    const newTask: Task = {
      ...parsedTask,
      id: Date.now().toString(),
      status: 'pending',
      hasReminder,
      reminderDays,
    }

    // Call callback to add task to parent state
    if (onTaskCreate) {
      onTaskCreate(newTask)
    }

    // Reset form
    setInput('')
    setHasReminder(false)
    setReminderDays('1')
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="font-semibold text-foreground mb-3">Quick Add Task</h3>
        
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setInputMode('ai')}
            variant={inputMode === 'ai' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
          >
            🤖 AI Input
          </Button>
          <Button
            onClick={() => setInputMode('form')}
            variant={inputMode === 'form' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
          >
            📝 Manual
          </Button>
        </div>

        {/* AI Input Mode */}
        {inputMode === 'ai' && (
          <form onSubmit={handleAIInput} className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Describe your task in natural language
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='e.g., "my rent is due March 15"&#10;or "renew car insurance next month"'
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>
            
            {/* Reminder Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReminder}
                  onChange={(e) => setHasReminder(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground">Set reminder</span>
              </label>
              
              {hasReminder && (
                <div className="pl-6">
                  <label className="block text-xs text-muted-foreground mb-1">Remind me</label>
                  <select
                    value={reminderDays}
                    onChange={(e) => setReminderDays(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                  >
                    <option value="0">On due date</option>
                    <option value="1">1 day before</option>
                    <option value="3">3 days before</option>
                    <option value="7">1 week before</option>
                    <option value="14">2 weeks before</option>
                    <option value="30">1 month before</option>
                  </select>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? 'Processing...' : 'Parse & Create'}
            </Button>
            <p className="text-xs text-muted-foreground">
              AI will automatically extract dates, priorities, and categories
            </p>
          </form>
        )}

        {/* Manual Form Mode */}
        {inputMode === 'form' && (
          <Link href="/tasks/new" className="block">
            <Button variant="outline" className="w-full">
              Open Full Form
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Templates */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="font-semibold text-foreground mb-3 text-sm">Quick Templates</h4>
        <div className="space-y-2">
          {[
            { icon: '💰', label: 'Pay Bill', example: 'Electricity bill due next week', text: 'Pay electricity bill due next week' },
            { icon: '⚖️', label: 'Renew License', example: 'Driver license', text: 'Renew driver license next month' },
            { icon: '🏥', label: 'Doctor Appointment', example: 'Annual checkup', text: 'Doctor appointment for annual checkup tomorrow' },
            { icon: '🏠', label: 'Home Maintenance', example: 'Fix roof leak', text: 'Fix roof leak urgent' },
          ].map((template) => (
            <button
              key={template.label}
              onClick={() => {
                setInput(template.text)
                setInputMode('ai')
              }}
              className="w-full text-left p-2 rounded border border-border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{template.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{template.label}</div>
                  <div className="text-xs text-muted-foreground">{template.example}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary/5 rounded-lg border border-primary/20 p-3">
        <p className="text-xs text-foreground font-medium mb-2">💡 Tips for AI Parsing:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Include dates: "due March 15" or "next month"</li>
          <li>• Mention priority: "urgent", "important"</li>
          <li>• Add category hints: "doctor", "bills", "renewal"</li>
        </ul>
      </div>
    </div>
  )
}
