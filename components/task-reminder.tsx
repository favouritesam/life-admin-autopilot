'use client'

import { useEffect, useRef, useState } from 'react'

interface TaskReminderProps {
  tasks: Array<{
    id: string
    dueDate: Date
    status: string
  }>
  onAlarmingTasksChange?: (taskIds: string[]) => void
}

export function TaskReminder({ tasks, onAlarmingTasksChange }: TaskReminderProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playBeep = () => {
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

    oscillator.frequency.value = 800 // 800Hz beep
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.5)
  }

  useEffect(() => {
    // Check every 2 seconds for tasks due within 24 hours
    intervalRef.current = setInterval(() => {
      const now = new Date()
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      // Find pending tasks due within 24 hours
      const urgentTasks = tasks.filter(task => {
        if (task.status !== 'pending') return false
        const dueDate = new Date(task.dueDate)
        return dueDate <= oneDayFromNow && dueDate >= now
      })

      // Notify parent about alarming tasks
      if (onAlarmingTasksChange) {
        onAlarmingTasksChange(urgentTasks.map(t => t.id))
      }

      // Play beep if there are urgent tasks
      if (urgentTasks.length > 0) {
        playBeep()
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
