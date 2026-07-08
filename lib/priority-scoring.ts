interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
}

export function calculateAutoPriority(task: Partial<Task>): 'high' | 'medium' | 'low' {
  if (!task.dueDate) return 'medium'

  const now = new Date()
  const dueDate = new Date(task.dueDate)
  const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate base urgency score from due date
  let urgencyScore = 0

  if (daysUntilDue <= 0) {
    urgencyScore = 100 // Overdue - highest urgency
  } else if (daysUntilDue <= 1) {
    urgencyScore = 90 // Due today or tomorrow
  } else if (daysUntilDue <= 3) {
    urgencyScore = 75 // Due within 3 days
  } else if (daysUntilDue <= 7) {
    urgencyScore = 60 // Due within a week
  } else if (daysUntilDue <= 14) {
    urgencyScore = 45 // Due within 2 weeks
  } else if (daysUntilDue <= 30) {
    urgencyScore = 30 // Due within a month
  } else {
    urgencyScore = 15 // Due later
  }

  // Adjust based on category importance
  const categoryWeights: Record<string, number> = {
    finance: 1.3,
    health: 1.2,
    legal: 1.25,
    work: 1.1,
    home: 1.0,
    personal: 0.9,
  }

  if (task.category && categoryWeights[task.category]) {
    urgencyScore *= categoryWeights[task.category]
  }

  // Adjust based on task length (longer description = more complex = higher priority)
  if (task.description && task.description.length > 100) {
    urgencyScore *= 1.1
  }

  // Cap at 100
  urgencyScore = Math.min(urgencyScore, 100)

  // Convert score to priority
  if (urgencyScore >= 70) return 'high'
  if (urgencyScore >= 40) return 'medium'
  return 'low'
}

export function getPriorityScore(task: Partial<Task>): number {
  if (!task.dueDate) return 0

  const now = new Date()
  const dueDate = new Date(task.dueDate)
  const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  let score = 0

  if (daysUntilDue <= 0) score = 100
  else if (daysUntilDue <= 1) score = 90
  else if (daysUntilDue <= 3) score = 75
  else if (daysUntilDue <= 7) score = 60
  else if (daysUntilDue <= 14) score = 45
  else if (daysUntilDue <= 30) score = 30
  else score = 15

  const categoryWeights: Record<string, number> = {
    finance: 1.3,
    health: 1.2,
    legal: 1.25,
    work: 1.1,
    home: 1.0,
    personal: 0.9,
  }

  if (task.category && categoryWeights[task.category]) {
    score *= categoryWeights[task.category]
  }

  if (task.description && task.description.length > 100) {
    score *= 1.1
  }

  return Math.min(Math.round(score), 100)
}
