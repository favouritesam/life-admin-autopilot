'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TaskParserProps {
  onTaskCreated: (task: any) => void
}

export default function TaskParser({ onTaskCreated }: TaskParserProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState<any>(null)

  const handleParse = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    setError('')
    setParsed(null)

    const token = localStorage.getItem('auth_token')

    try {
      // First parse the text
      const parseRes = await fetch('http://localhost:8000/api/tasks/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input }),
      })

      if (!parseRes.ok) throw new Error('Failed to parse')

      const parseData = await parseRes.json()
      setParsed(parseData)
    } catch (err) {
      setError('Error parsing task. Try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!parsed) return

    setIsLoading(true)
    setError('')

    const token = localStorage.getItem('auth_token')

    try {
      // Save all parsed tasks
      const saveRes = await fetch('http://localhost:8000/api/tasks/parse-and-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input }),
      })

      if (!saveRes.ok) throw new Error('Failed to save')

      const saveData = await saveRes.json()
      setInput('')
      setParsed(null)
      
      // Notify parent
      if (saveData.tasks && saveData.tasks.length > 0) {
        onTaskCreated(saveData.tasks[0])
      }
    } catch (err) {
      setError('Error saving tasks. Try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tell me about your task or event
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., My rent is due March 15th. Renew my driver's license next month. Buy birthday gift for my mom."
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={4}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {parsed ? (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-foreground mb-3">Parsed Tasks ({parsed.tasks.length})</h3>
            <div className="space-y-3">
              {parsed.tasks.map((task: any, idx: number) => (
                <div key={idx} className="bg-background p-3 rounded border border-border">
                  <p className="font-medium text-foreground">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                    {task.priority && <span>⚡ {task.priority}</span>}
                    {task.category && <span>🏷️ {task.category}</span>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Confidence: {(parsed.confidence * 100).toFixed(0)}%
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Tasks'}
            </Button>
            <Button
              onClick={() => {
                setInput('')
                setParsed(null)
              }}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleParse}
          disabled={isLoading || !input.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? 'Parsing...' : 'Parse with AI'}
        </Button>
      )}
    </div>
  )
}
