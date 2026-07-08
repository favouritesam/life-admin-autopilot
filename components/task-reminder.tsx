'use client'

import { useEffect, useRef, useState } from 'react'

interface TaskReminderProps {
  tasks: Array<{
    id: string
    dueDate: Date
    status: string
    priority?: 'high' | 'medium' | 'low'
  }>
  onAlarmingTasksChange?: (taskIds: string[]) => void
}

export function TaskReminder({ tasks, onAlarmingTasksChange }: TaskReminderProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playBeep = (frequency: number = 800, duration: number = 0.5) => {
    if (typeof window === 'undefined') return

    // Create audio context if not exists
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + duration)
  }

  useEffect(() => {
    // Check every 2 seconds for tasks due within various timeframes
    intervalRef.current = setInterval(() => {
      const now = new Date()
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      // Find pending tasks due within different timeframes
      const urgentTasks = tasks.filter(task => {
        if (task.status !== 'pending') return false
        const dueDate = new Date(task.dueDate)
        return dueDate <= oneDayFromNow && dueDate >= now
      })

      const warningTasks = tasks.filter(task => {
        if (task.status !== 'pending') return false
        const dueDate = new Date(task.dueDate)
        return dueDate <= threeDaysFromNow && dueDate > oneDayFromNow
      })

      const upcomingTasks = tasks.filter(task => {
        if (task.status !== 'pending') return false
        const dueDate = new Date(task.dueDate)
        return dueDate <= oneWeekFromNow && dueDate > threeDaysFromNow
      })

      // Notify parent about alarming tasks (urgent + warning)
      if (onAlarmingTasksChange) {
        onAlarmingTasksChange([...urgentTasks, ...warningTasks].map(t => t.id))
      }

      // Play different beeps based on urgency
      if (urgentTasks.length > 0) {
        // High urgency - higher frequency, shorter duration
        playBeep(1000, 0.3)
      } else if (warningTasks.length > 0) {
        // Medium urgency - medium frequency
        playBeep(800, 0.5)
      } else if (upcomingTasks.length > 0) {
        // Low urgency - lower frequency, longer duration
        playBeep(600, 0.7)
      }
    }, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [tasks, onAlarmingTasksChange])

  return null // This component doesn't render anything
}
