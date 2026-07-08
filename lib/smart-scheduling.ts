interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'completed'
  estimatedDuration?: number // in minutes
}

interface ScheduledTask {
  task: Task
  scheduledDate: Date
  scheduledTime: string
  duration: number
}

export function scheduleTasks(
  tasks: Task[],
  availableSlots: { start: Date; end: Date; duration: number }[]
): ScheduledTask[] {
  const scheduledTasks: ScheduledTask[] = []
  const pendingTasks = tasks
    .filter(t => t.status === 'pending')
    .sort((a, b) => {
      // Sort by due date first
      const dateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      if (dateDiff !== 0) return dateDiff
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  for (const task of pendingTasks) {
    const taskDuration = task.estimatedDuration || 30 // Default 30 minutes
    const dueDate = new Date(task.dueDate)
    
    // Find the best available slot
    for (const slot of availableSlots) {
      const slotEnd = new Date(slot.start.getTime() + slot.duration * 60000)
      
      // Check if task fits in slot and is before due date
      if (taskDuration <= slot.duration && slotEnd <= dueDate) {
        scheduledTasks.push({
          task,
          scheduledDate: slot.start,
          scheduledTime: slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: taskDuration,
        })
        
        // Remove this slot from available slots
        const slotIndex = availableSlots.indexOf(slot)
        availableSlots.splice(slotIndex, 1)
        break
      }
    }
  }

  return scheduledTasks
}

export function generateAvailableSlots(
  startDate: Date,
  endDate: Date,
  workHours: { start: number; end: number } = { start: 9, end: 17 },
  breakDuration: number = 60
): { start: Date; end: Date; duration: number }[] {
  const slots: { start: Date; end: Date; duration: number }[] = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    // Skip weekends
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Create work day slot
      const workStart = new Date(current)
      workStart.setHours(workHours.start, 0, 0, 0)
      
      const workEnd = new Date(current)
      workEnd.setHours(workHours.end, 0, 0, 0)
      
      // Add break in the middle
      const breakStart = new Date(current)
      breakStart.setHours(12, 0, 0, 0)
      
      const breakEnd = new Date(current)
      breakEnd.setHours(13, 0, 0, 0)
      
      // Morning slot
      const morningDuration = (breakStart.getTime() - workStart.getTime()) / 60000
      if (morningDuration > 0) {
        slots.push({
          start: workStart,
          end: breakStart,
          duration: morningDuration,
        })
      }
      
      // Afternoon slot
      const afternoonDuration = (workEnd.getTime() - breakEnd.getTime()) / 60000
      if (afternoonDuration > 0) {
        slots.push({
          start: breakEnd,
          end: workEnd,
          duration: afternoonDuration,
        })
      }
    }
    
    // Move to next day
    current.setDate(current.getDate() + 1)
  }
  
  return slots
}

export function optimizeTaskOrder(tasks: Task[]): Task[] {
  // Group tasks by category to minimize context switching
  const taskGroups: Record<string, Task[]> = {}
  
  tasks.forEach(task => {
    if (!taskGroups[task.category]) {
      taskGroups[task.category] = []
    }
    taskGroups[task.category].push(task)
  })
  
  // Sort each group by priority and due date
  Object.keys(taskGroups).forEach(category => {
    taskGroups[category].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  })
  
  // Order groups by highest priority tasks
  const sortedCategories = Object.keys(taskGroups).sort((a, b) => {
    const aHighestPriority = taskGroups[a][0]?.priority || 'low'
    const bHighestPriority = taskGroups[b][0]?.priority || 'low'
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[aHighestPriority] - priorityOrder[bHighestPriority]
  })
  
  // Flatten back to single array
  const optimizedTasks: Task[] = []
  sortedCategories.forEach(category => {
    optimizedTasks.push(...taskGroups[category])
  })
  
  return optimizedTasks
}
