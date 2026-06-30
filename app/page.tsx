// 'use client'
//
// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import Navigation from '@/components/navigation'
// import DashboardTimeline from '@/components/dashboard-timeline'
// import TaskQuickAdd from '@/components/task-quick-add'
//
// export default function Dashboard() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(true)
//   const [userName, setUserName] = useState('there')
//
//   useEffect(() => {
//     // Check auth status
//     const checkAuth = async () => {
//       try {
//         setIsLoading(false)
//         setUserName('Emma Watson')
//       } catch (error) {
//         router.push('/sign-in')
//       }
//     }
//     checkAuth()
//   }, [router])
//
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Navigation />
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <p className="text-muted-foreground">Loading...</p>
//         </main>
//       </div>
//     )
//   }
//
//   return (
//     <div className="min-h-screen bg-background">
//       <Navigation />
//
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header Section */}
//         <div className="mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
//                 Your Life Admin
//               </h1>
//               <p className="text-muted-foreground">
//                 Manage all your important events, bills, and deadlines in one place
//               </p>
//             </div>
//             <Link href="/tasks/new">
//               <Button className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap">
//                 Add New Task
//               </Button>
//             </Link>
//           </div>
//         </div>
//
//         {/* Quick Add & Timeline Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Quick Add Section */}
//           <div className="lg:col-span-1">
//             <TaskQuickAdd />
//           </div>
//
//           {/* Timeline Section */}
//           <div className="lg:col-span-2">
//             <DashboardTimeline />
//           </div>
//         </div>
//
//         {/* Stats Section */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
//           <div className="bg-card rounded-lg border border-border p-4">
//             <div className="text-sm text-muted-foreground mb-1">Total Tasks</div>
//             <div className="text-3xl font-bold text-foreground">0</div>
//           </div>
//           <div className="bg-card rounded-lg border border-border p-4">
//             <div className="text-sm text-muted-foreground mb-1">Due This Week</div>
//             <div className="text-3xl font-bold text-foreground">0</div>
//           </div>
//           <div className="bg-card rounded-lg border border-border p-4">
//             <div className="text-sm text-muted-foreground mb-1">Completed</div>
//             <div className="text-3xl font-bold text-foreground">0</div>
//           </div>
//           <div className="bg-card rounded-lg border border-border p-4">
//             <div className="text-sm text-muted-foreground mb-1">Reminders Set</div>
//             <div className="text-3xl font-bold text-foreground">0</div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }



'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          // User is authenticated, go to dashboard
          router.push('/dashboard')
        } else {
          // User is not authenticated, go to landing page
          router.push('/landing')
        }
      } catch (error) {
        // If error, go to landing page
        router.push('/landing')
      }
    }

    checkAuth()
  }, [router])

  return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
  )
}
