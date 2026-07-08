'use client'

interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
  createdAt?: Date
  completedAt?: Date
}

interface ProductivityScoreProps {
  tasks: Task[]
}

export function ProductivityScore({ tasks }: ProductivityScoreProps) {
  const calculateProductivityScore = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const pendingTasks = tasks.filter(t => t.status === 'pending')
    const totalTasks = tasks.length

    if (totalTasks === 0) return 0

    // Base score from completion rate (40% weight)
    const completionRate = completedTasks.length / totalTasks
    const completionScore = completionRate * 40

    // High priority completion bonus (25% weight)
    const highPriorityTotal = tasks.filter(t => t.priority === 'high').length
    const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length
    const highPriorityScore = highPriorityTotal > 0 ? (highPriorityCompleted / highPriorityTotal) * 25 : 0

    // On-time completion bonus (20% weight)
    const onTimeCompleted = completedTasks.filter(t => {
      if (!t.completedAt || !t.dueDate) return false
      return new Date(t.completedAt) <= new Date(t.dueDate)
    }).length
    const onTimeScore = completedTasks.length > 0 ? (onTimeCompleted / completedTasks.length) * 20 : 0

    // Category diversity bonus (15% weight)
    const uniqueCategories = new Set(tasks.map(t => t.category)).size
    const categoryScore = Math.min((uniqueCategories / 6) * 15, 15)

    const totalScore = Math.round(completionScore + highPriorityScore + onTimeScore + categoryScore)

    return Math.min(Math.max(totalScore, 0), 100)
  }

  const score = calculateProductivityScore()
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Great'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    if (score >= 40) return 'Needs Improvement'
    return 'Poor'
  }

  const getScoreMessage = () => {
    if (score >= 80) return "You're crushing it! Keep up the amazing work!"
    if (score >= 60) return "Good progress! Focus on completing high-priority tasks."
    if (score >= 40) return "Room for improvement. Try to complete more tasks on time."
    return "Let's get productive! Start by tackling your high-priority tasks."
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">📊 Productivity Score</h2>

      <div className="text-center mb-6">
        <div className={`text-7xl font-bold ${getScoreColor()} mb-2`}>
          {score}
        </div>
        <div className="text-lg text-foreground mb-1">{getScoreLabel()}</div>
        <div className="text-sm text-muted-foreground">
          {getScoreMessage()}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Completion Rate</span>
          <span className="text-foreground font-medium">
            {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">High Priority Focus</span>
          <span className="text-foreground font-medium">
            {tasks.filter(t => t.priority === 'high').length > 0
              ? Math.round((tasks.filter(t => t.priority === 'high' && t.status === 'completed').length / tasks.filter(t => t.priority === 'high').length) * 100)
              : 0}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">On-Time Completion</span>
          <span className="text-foreground font-medium">
            {tasks.filter(t => t.status === 'completed').length > 0
              ? Math.round((tasks.filter(t => t.status === 'completed' && t.completedAt && t.dueDate && new Date(t.completedAt) <= new Date(t.dueDate)).length / tasks.filter(t => t.status === 'completed').length) * 100)
              : 0}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Category Diversity</span>
          <span className="text-foreground font-medium">
            {new Set(tasks.map(t => t.category)).size}/6
          </span>
        </div>
      </div>

      {/* Progress Circle */}
      <div className="mt-6 flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
              className={getScoreColor().replace('text-', 'text-')}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
