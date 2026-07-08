'use client'

interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
  completedAt?: Date
}

interface StreakTrackerProps {
  tasks: Task[]
}

export function StreakTracker({ tasks }: StreakTrackerProps) {
  const calculateStreak = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt)
    
    if (completedTasks.length === 0) return 0

    // Get unique dates when tasks were completed
    const completedDates = new Set(
      completedTasks.map(t => {
        const date = new Date(t.completedAt!)
        return date.toDateString()
      })
    )

    // Sort dates and calculate consecutive days
    const sortedDates = Array.from(completedDates)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime())

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const date of sortedDates) {
      const taskDate = new Date(date)
      taskDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === streak) {
        streak++
        currentDate = new Date(taskDate.getTime() - 24 * 60 * 60 * 1000)
      } else {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()
  const getStreakMessage = () => {
    if (streak === 0) return "Start your streak today!"
    if (streak === 1) return "1 day - Keep it going!"
    if (streak < 7) return `${streak} days - Great start!`
    if (streak < 14) return `${streak} days - Amazing!`
    if (streak < 30) return `${streak} days - Incredible!`
    return `${streak} days - Legendary!`
  }

  const getStreakColor = () => {
    if (streak === 0) return 'text-muted-foreground'
    if (streak < 7) return 'text-yellow-500'
    if (streak < 14) return 'text-orange-500'
    if (streak < 30) return 'text-red-500'
    return 'text-purple-500'
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">🔥 Streak Tracker</h2>

      <div className="text-center">
        <div className={`text-6xl font-bold ${getStreakColor()} mb-2`}>
          {streak}
        </div>
        <div className="text-lg text-foreground mb-1">days</div>
        <div className="text-sm text-muted-foreground">
          {getStreakMessage()}
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${streak >= 1 ? 'bg-green-500' : 'bg-muted'}`} />
          <div className="text-sm text-foreground">1 day</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${streak >= 7 ? 'bg-green-500' : 'bg-muted'}`} />
          <div className="text-sm text-foreground">7 days (1 week)</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${streak >= 14 ? 'bg-green-500' : 'bg-muted'}`} />
          <div className="text-sm text-foreground">14 days (2 weeks)</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${streak >= 30 ? 'bg-green-500' : 'bg-muted'}`} />
          <div className="text-sm text-foreground">30 days (1 month)</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${streak >= 100 ? 'bg-green-500' : 'bg-muted'}`} />
          <div className="text-sm text-foreground">100 days</div>
        </div>
      </div>
    </div>
  )
}
