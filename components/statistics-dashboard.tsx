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
}

interface StatisticsDashboardProps {
  tasks: Task[]
}

export function StatisticsDashboard({ tasks }: StatisticsDashboardProps) {
  const getCompletionRate = () => {
    if (tasks.length === 0) return 0
    const completed = tasks.filter(t => t.status === 'completed').length
    return Math.round((completed / tasks.length) * 100)
  }

  const getTasksByPriority = () => {
    return {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    }
  }

  const getTasksByCategory = () => {
    const categories = ['finance', 'health', 'work', 'personal', 'home', 'legal']
    return categories.map(cat => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: tasks.filter(t => t.category === cat).length,
    }))
  }

  const getWeeklyCompletion = () => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekTasks = tasks.filter(t => {
      const createdAt = t.createdAt ? new Date(t.createdAt) : new Date()
      return createdAt >= weekAgo && createdAt <= today
    })
    const completed = weekTasks.filter(t => t.status === 'completed').length
    return { total: weekTasks.length, completed }
  }

  const completionRate = getCompletionRate()
  const priorityStats = getTasksByPriority()
  const categoryStats = getTasksByCategory()
  const weeklyStats = getWeeklyCompletion()

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Statistics Dashboard</h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="text-2xl font-bold text-primary">{tasks.length}</div>
          <div className="text-sm text-muted-foreground">Total Tasks</div>
        </div>
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="text-2xl font-bold text-green-500">{completionRate}%</div>
          <div className="text-sm text-muted-foreground">Completion Rate</div>
        </div>
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="text-2xl font-bold text-blue-500">{weeklyStats.completed}</div>
          <div className="text-sm text-muted-foreground">Completed This Week</div>
        </div>
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="text-2xl font-bold text-yellow-500">{priorityStats.high}</div>
          <div className="text-sm text-muted-foreground">High Priority</div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground mb-3">Priority Distribution</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-24 text-sm text-muted-foreground">High</div>
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${tasks.length > 0 ? (priorityStats.high / tasks.length) * 100 : 0}%` }}
              />
            </div>
            <div className="w-8 text-sm text-foreground">{priorityStats.high}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 text-sm text-muted-foreground">Medium</div>
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${tasks.length > 0 ? (priorityStats.medium / tasks.length) * 100 : 0}%` }}
              />
            </div>
            <div className="w-8 text-sm text-foreground">{priorityStats.medium}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 text-sm text-muted-foreground">Low</div>
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${tasks.length > 0 ? (priorityStats.low / tasks.length) * 100 : 0}%` }}
              />
            </div>
            <div className="w-8 text-sm text-foreground">{priorityStats.low}</div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Category Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categoryStats.map(cat => (
            <div key={cat.name} className="bg-background rounded-lg p-3 border border-border">
              <div className="text-lg font-semibold text-foreground">{cat.count}</div>
              <div className="text-xs text-muted-foreground">{cat.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
