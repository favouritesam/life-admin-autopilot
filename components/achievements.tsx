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

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
}

interface AchievementsProps {
  tasks: Task[]
}

export function Achievements({ tasks }: AchievementsProps) {
  const calculateAchievements = (): Achievement[] => {
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const totalTasks = tasks.length
    const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length
    const categories = new Set(tasks.map(t => t.category)).size

    const achievements: Achievement[] = [
      {
        id: 'first-task',
        title: 'First Steps',
        description: 'Complete your first task',
        icon: '🎯',
        unlocked: completedTasks.length >= 1,
        progress: Math.min(completedTasks.length, 1),
        maxProgress: 1,
      },
      {
        id: 'ten-tasks',
        title: 'Getting Started',
        description: 'Complete 10 tasks',
        icon: '🌟',
        unlocked: completedTasks.length >= 10,
        progress: Math.min(completedTasks.length, 10),
        maxProgress: 10,
      },
      {
        id: 'fifty-tasks',
        title: 'Task Master',
        description: 'Complete 50 tasks',
        icon: '🏆',
        unlocked: completedTasks.length >= 50,
        progress: Math.min(completedTasks.length, 50),
        maxProgress: 50,
      },
      {
        id: 'hundred-tasks',
        title: 'Legendary',
        description: 'Complete 100 tasks',
        icon: '👑',
        unlocked: completedTasks.length >= 100,
        progress: Math.min(completedTasks.length, 100),
        maxProgress: 100,
      },
      {
        id: 'high-priority',
        title: 'Priority Focus',
        description: 'Complete 10 high priority tasks',
        icon: '🔥',
        unlocked: highPriorityCompleted >= 10,
        progress: Math.min(highPriorityCompleted, 10),
        maxProgress: 10,
      },
      {
        id: 'all-categories',
        title: 'Well Rounded',
        description: 'Complete tasks in all 6 categories',
        icon: '🎨',
        unlocked: categories >= 6,
        progress: categories,
        maxProgress: 6,
      },
      {
        id: 'perfect-day',
        title: 'Perfect Day',
        description: 'Complete all pending tasks',
        icon: '✨',
        unlocked: totalTasks > 0 && completedTasks.length === totalTasks,
        progress: totalTasks > 0 ? completedTasks.length : 0,
        maxProgress: totalTasks || 1,
      },
    ]

    return achievements
  }

  const achievements = calculateAchievements()
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">🏅 Achievements</h2>
        <div className="text-sm text-muted-foreground">
          {unlockedCount}/{achievements.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`rounded-lg border p-4 transition-all ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-500/50'
                : 'bg-background border-border opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {achievement.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {achievement.description}
                </p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      achievement.unlocked ? 'bg-yellow-500' : 'bg-primary'
                    }`}
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {achievement.progress}/{achievement.maxProgress}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
