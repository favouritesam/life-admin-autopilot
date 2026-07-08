'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import Navigation from '@/components/navigation'
import DashboardTimeline from '@/components/dashboard-timeline'
import TaskQuickAdd from '@/components/task-quick-add'
import {CategoryProgress} from '@/components/category-progress'
import {StatisticsDashboard} from '@/components/statistics-dashboard'
import {StreakTracker} from '@/components/streak-tracker'
import {Achievements} from '@/components/achievements'
import {ProductivityScore} from '@/components/productivity-score'
import {TaskSuggestions} from '@/components/task-suggestions'
import {toast} from 'sonner'
import {ConfirmDialog} from '@/components/confirm-dialog'
import {TaskReminder} from '@/components/task-reminder'

interface Task {
    id: string
    title: string
    description?: string
    dueDate: Date
    priority: 'high' | 'medium' | 'low'
    category: string
    status: 'pending' | 'completed'
    hasReminder?: boolean
    reminderDays?: string
}

export default function Dashboard() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [userName, setUserName] = useState('')
    const [tasks, setTasks] = useState<Task[]>([])
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
    const [alarmingTaskIds, setAlarmingTaskIds] = useState<string[]>([])

    useEffect(() => {
        // Check if user is authenticated and get user data
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/session', {
                    credentials: 'include',
                })

                if (!response.ok) {
                    // Not authenticated, redirect to landing
                    router.push('/landing')
                    return
                }

                const session = await response.json()
                if (session?.user?.name) {
                    setUserName(session.user.name)
                }

                // Fetch user's tasks
                await fetchTasks()
            } catch (error) {
                router.push('/landing')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router])

    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks', {
                credentials: 'include',
            })
            if (response.ok) {
                const tasksData = await response.json()
                setTasks(tasksData.map((task: any) => ({
                    id: task.id.toString(),
                    title: task.title,
                    description: task.description,
                    dueDate: new Date(task.dueDate),
                    priority: task.priority,
                    category: task.category,
                    status: task.status,
                })))
            }
        } catch (error) {
            console.error('Error fetching tasks:', error)
        }
    }

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return

        const newStatus = task.status === 'completed' ? 'pending' : 'completed'

        // Optimistic update
        setTasks(tasks.map(t =>
            t.id === id ? {...t, status: newStatus} : t
        ))

        // Save to API
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({status: newStatus}),
            })

            if (!response.ok) {
                // Revert on error
                setTasks(tasks.map(t =>
                    t.id === id ? {...t, status: task.status} : t
                ))
                toast.error('Failed to update task')
            } else {
                toast.success('Task updated')
            }
        } catch (error) {
            console.error('Error updating task:', error)
            // Revert on error
            setTasks(tasks.map(t =>
                t.id === id ? {...t, status: task.status} : t
            ))
            toast.error('Error updating task')
        }
    }

    const deleteTask = async (id: string) => {
        setTaskToDelete(id)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!taskToDelete) return

        setIsDeleteModalOpen(false)

        toast.promise(
            (async () => {
                // Delete from API
                const response = await fetch(`/api/tasks/${taskToDelete}`, {
                    method: 'DELETE',
                    credentials: 'include',
                })

                if (!response.ok) {
                    throw new Error('Failed to delete task')
                }

                // Optimistic update on success
                setTasks(tasks.filter(t => t.id !== taskToDelete))
                setTaskToDelete(null)
                return true
            })(),
            {
                loading: 'Deleting task...',
                success: 'Task deleted',
                error: 'Failed to delete task',
            }
        )
    }

    const cancelDelete = () => {
        setIsDeleteModalOpen(false)
        setTaskToDelete(null)
    }

    const handleTaskCreate = async (newTask: Task) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    dueDate: newTask.dueDate.toISOString(),
                    priority: newTask.priority,
                    category: newTask.category,
                    hasReminder: newTask.hasReminder,
                    reminderDays: newTask.reminderDays,
                }),
            })

            if (response.ok) {
                const createdTask = await response.json()
                // Add the created task with its database ID
                setTasks([...tasks, {
                    ...newTask,
                    id: createdTask.id.toString(),
                }])
                toast.success('Task created successfully')
            } else {
                toast.error('Failed to create task')
            }
        } catch (error) {
            console.error('Error creating task:', error)
            toast.error('Error creating task')
        }
    }

    const pendingTasks = tasks.filter(t => t.status === 'pending')
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const overdueTasks = tasks.filter(t => {
        const today = new Date()
        return t.status === 'pending' && t.dueDate < today
    })
    const thisWeekTasks = tasks.filter(t => {
        const today = new Date()
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        return t.status === 'pending' && t.dueDate >= today && t.dueDate <= weekFromNow
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation/>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Welcome back, {userName || 'there'}! 👋
                    </h1>
                    <p className="text-muted-foreground">
                        Your personal life admin assistant is ready to help you stay organized.
                    </p>
                </div>


                {/* Bottom Section - Statistics */}
                <div className="mt-8">
                    <StatisticsDashboard tasks={tasks}/>
                </div>

                {/* Bottom Section - Achievements */}
                <div className="mt-8">
                    <Achievements tasks={tasks}/>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                    {/* Left Column - Quick Add & Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <TaskQuickAdd onTaskCreate={handleTaskCreate}/>

                        {/* Streak Tracker */}
                        <StreakTracker tasks={tasks}/>

                        {/* Productivity Score */}
                        <ProductivityScore tasks={tasks}/>

                        {/* Category Progress */}
                        <CategoryProgress tasks={tasks}/>

                        {/* AI Suggestions */}
                        <TaskSuggestions tasks={tasks}/>

                        {/* Urgency Suggestions */}
                        <div
                            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-6">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <span>🎯</span> What to Focus On
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-card rounded-lg p-3 border border-border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-red-500">🔴</span>
                                        <span className="text-sm font-medium text-foreground">Urgent</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Complete tasks due within 24 hours
                                    </p>
                                </div>
                                <div className="bg-card rounded-lg p-3 border border-border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-yellow-500">🟡</span>
                                        <span className="text-sm font-medium text-foreground">This Week</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Plan for upcoming bills and renewals
                                    </p>
                                </div>
                                <div className="bg-card rounded-lg p-3 border border-border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-green-500">🟢</span>
                                        <span className="text-sm font-medium text-foreground">Upcoming</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Schedule future events and reminders
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-card rounded-lg border border-border p-6">
                            <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-primary/5 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{pendingTasks.length}</div>
                                    <div className="text-xs text-muted-foreground">Pending Tasks</div>
                                </div>
                                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                                    <div className="text-xs text-muted-foreground">Completed</div>
                                </div>
                                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
                                    <div className="text-xs text-muted-foreground">Overdue</div>
                                </div>
                                <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">{thisWeekTasks.length}</div>
                                    <div className="text-xs text-muted-foreground">This Week</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Timeline */}
                    <div className="lg:col-span-2">
                        <div className="bg-card rounded-lg border border-border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-foreground">Your Life Timeline</h2>
                                <span className="text-sm text-muted-foreground">
                                    Organized by urgency and date
                                </span>
                            </div>
                            <DashboardTimeline tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} alarmingTaskIds={alarmingTaskIds}/>
                        </div>
                    </div>
                </div>

            </main>

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                confirmText="Delete"
                cancelText="Cancel"
            />

            {/* Task Reminder - plays beep for tasks due within 24 hours */}
            <TaskReminder tasks={tasks} onAlarmingTasksChange={setAlarmingTaskIds} />
        </div>
    )
}