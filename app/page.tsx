'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
    const [isDark, setIsDark] = useState(true)

    return (
        <div className={isDark ? 'dark' : ''}>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
                {/* Header */}
                <header className="container mx-auto px-4 py-6">
                    <nav className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold gradient-text">SwiftVote</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all"
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                    </svg>
                                )}
                            </button>
                            <Link
                                href="/auth/login"
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg hover:scale-105 transition-all"
                            >
                                Login
                            </Link>
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="container mx-auto px-4 py-20">
                    <div className="text-center max-w-4xl mx-auto animate-fade-in">
                        <div className="inline-block mb-4 px-4 py-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                ⚡ Real-time Polling Platform
                            </span>
                        </div>

                        <h2 className="text-6xl md:text-7xl font-bold mb-6 animate-slide-up">
                            <span className="gradient-text">Voting</span>
                            <br />
                            <span className="text-gray-800 dark:text-white">Made Simple</span>
                        </h2>

                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 animate-slide-up">
                            Buat polling real-time, lihat hasil instan, dan dapatkan insight dari audiensmu.
                            <br />
                            Tanpa refresh, tanpa delay, semuanya real-time.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
                            <Link
                                href="/auth/signup"
                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
                            >
                                Mulai Sekarang - Gratis
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-8 py-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-800 dark:text-white font-bold text-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
                            >
                                Lihat Demo
                            </Link>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto">
                        <div className="p-8 rounded-2xl glass-effect hover:scale-105 transition-all group">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Real-time Updates</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Lihat hasil voting berubah secara instan tanpa perlu refresh halaman.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl glass-effect hover:scale-105 transition-all group">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Aman & Terpercaya</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Autentikasi ketat memastikan satu user hanya bisa vote sekali per poll.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl glass-effect hover:scale-105 transition-all group">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Visualisasi Cantik</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Chart interaktif yang indah membuat data voting mudah dipahami.
                            </p>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="mt-32 text-center">
                        <div className="inline-flex gap-16 p-10 rounded-3xl glass-effect">
                            <div>
                                <div className="text-5xl font-bold gradient-text mb-2">Real-time</div>
                                <div className="text-gray-600 dark:text-gray-300">Updates</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold gradient-text mb-2">100%</div>
                                <div className="text-gray-600 dark:text-gray-300">Aman</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold gradient-text mb-2">∞</div>
                                <div className="text-gray-600 dark:text-gray-300">Polls</div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200 dark:border-gray-800">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        <p>&copy; 2024 SwiftVote. Powered by Next.js & Supabase.</p>
                    </div>
                </footer>
            </div>
        </div>
    )
}
