'use client'

interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
}

interface CategoryProgressProps {
  tasks: Task[]
}

const CATEGORIES = [
  { value: 'finance', label: 'Finance', icon: '💰', color: 'from-green-500' },
  { value: 'health', label: 'Health', icon: '🏥', color: 'from-red-500' },
  { value: 'work', label: 'Work', icon: '💼', color: 'from-purple-500' },
  { value: 'personal', label: 'Personal', icon: '👤', color: 'from-pink-500' },
  { value: 'home', label: 'Home', icon: '🏠', color: 'from-yellow-500' },
  { value: 'legal', label: 'Legal', icon: '⚖️', color: 'from-blue-500' },
]

export function CategoryProgress({ tasks }: CategoryProgressProps) {
  const getCategoryProgress = (categoryValue: string) => {
    const categoryTasks = tasks.filter(t => t.category === categoryValue)
    const completed = categoryTasks.filter(t => t.status === 'completed').length
    const total = categoryTasks.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Category Progress</h2>

      <div className="space-y-4">
        {CATEGORIES.map(category => {
          const { completed, total, percentage } = getCategoryProgress(category.value)

          return (
            <div key={category.value} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium text-foreground">{category.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {completed}/{total} ({percentage}%)
                </span>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No tasks to show progress
        </div>
      )}
    </div>
  )
}
