'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Navigation */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                        LA
                    </div>
                    <span className="text-xl font-bold text-foreground">Life Admin</span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Link href="/sign-in">
                        <Button variant="outline">Sign In</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
                        Your Life, <span className="text-primary">Automated</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Never miss a bill payment, license renewal, or important deadline again.
                        Life Admin Autopilot intelligently manages all your life's recurring events
                        with AI-powered reminders and insights.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link href="/sign-up">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/sign-in">
                            <Button variant="outline" className="px-8 py-3 text-lg">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                    <div className="bg-card rounded-lg border border-border p-8 hover:border-primary/50 transition">
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">AI-Powered</h3>
                        <p className="text-muted-foreground">
                            Describe your events in natural language and let AI organize them intelligently.
                        </p>
                    </div>

                    <div className="bg-card rounded-lg border border-border p-8 hover:border-primary/50 transition">
                        <div className="text-4xl mb-4">⏰</div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Smart Reminders</h3>
                        <p className="text-muted-foreground">
                            Get timely email and push notifications for all your important events.
                        </p>
                    </div>

                    <div className="bg-card rounded-lg border border-border p-8 hover:border-primary/50 transition">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Timeline View</h3>
                        <p className="text-muted-foreground">
                            Visualize all your events on an interactive calendar and timeline.
                        </p>
                    </div>
                </div>

                {/* Feature List */}
                <div className="mt-20 bg-card rounded-lg border border-border p-12">
                    <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                        Everything You Need
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { icon: '💰', title: 'Bill Management', desc: 'Track recurring payments automatically' },
                            { icon: '🔄', title: 'Renewal Tracking', desc: 'Never miss subscriptions or licenses' },
                            { icon: '🏥', title: 'Health Reminders', desc: 'Medical appointments and checkups' },
                            { icon: '📅', title: 'Event Calendar', desc: 'All important dates in one place' },
                            { icon: '🔔', title: 'Smart Notifications', desc: 'Customizable reminder settings' },
                            { icon: '📱', title: 'Multi-Device', desc: 'Access from anywhere, anytime' },
                        ].map((feature, i) => (
                            <div key={i} className="flex gap-4">
                                <span className="text-3xl">{feature.icon}</span>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                                    <p className="text-muted-foreground text-sm">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-8">Simple Pricing</h2>
                    <div className="bg-card rounded-lg border border-border p-12 inline-block">
                        <div className="text-5xl font-bold text-primary mb-2">Free</div>
                        <p className="text-muted-foreground mb-6">Forever. No credit card required.</p>
                        <Link href="/sign-up">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                                Start Free Now
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-20 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-12 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        Ready to Take Control?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                        Join thousands of users who never miss important dates, payments, or renewals.
                    </p>
                    <Link href="/sign-up">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                            Create Your Free Account
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border mt-20 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
                    <p>&copy; 2026 Life Admin Autopilot. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}