'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { Poll, PollOption, Vote } from '@/lib/supabase'
import { castVote, getUserVoteStatus } from '@/app/actions/vote'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

export default function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const searchParams = useSearchParams()

    const [poll, setPoll] = useState<Poll | null>(null)
    const [options, setOptions] = useState<PollOption[]>([])
    const [votes, setVotes] = useState<Vote[]>([])
    const [userVote, setUserVote] = useState<Vote | null>(null)
    const [loading, setLoading] = useState(true)
    const [voting, setVoting] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        initializePage()

        // Subscription for real-time updates
        const channel = supabase
            .channel('votes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'votes',
                    filter: `poll_id=eq.${id}`,
                },
                (payload) => {
                    setVotes(prev => [...prev, payload.new as Vote])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id])

    const initializePage = async () => {
        try {
            // 1. Fetch Poll
            const { data: pollData, error: pollError } = await supabase
                .from('polls')
                .select('*')
                .eq('id', id)
                .single()

            if (pollError) throw pollError
            setPoll(pollData)

            // Check for new creation redirect
            if (searchParams.get('new') === 'true' && pollData.visibility === 'shared') {
                setShowShareModal(true)
            }

            // 2. Auth Check based on Poll Type
            if (pollData.auth_type === 'account') {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push(`/auth/login?next=/polls/${id}`)
                    return // Stop execution
                }
            }

            // 3. Fetch Options
            const { data: optionsData } = await supabase
                .from('poll_options')
                .select('*')
                .eq('poll_id', id)
            setOptions(optionsData || [])

            // 4. Fetch All Votes (for chart)
            const { data: votesData } = await supabase
                .from('votes')
                .select('*')
                .eq('poll_id', id)
            setVotes(votesData || [])

            // 5. Check if Current User/IP has voted (Server Action)
            const status = await getUserVoteStatus(id)
            if (status.hasVoted && status.vote) {
                // Manually cast to match client type (created_at might be Date vs string)
                setUserVote(status.vote as unknown as Vote)
            }

        } catch (error) {
            console.error('Error initializing poll:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleShare = () => {
        const url = window.location.href.split('?')[0] // Remove query params
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleVote = async (optionId: string) => {
        if (userVote || voting) return
        if (poll?.is_active === false) return

        setVoting(true)
        try {
            const result = await castVote(id, optionId)

            if (result?.error) {
                alert(result.error)
                return
            }

            // Success
            // Fetch status again to get the vote object
            const status = await getUserVoteStatus(id)
            if (status.hasVoted && status.vote) {
                setUserVote(status.vote as unknown as Vote)
            }

            // Refresh votes list
            const { data: votesData } = await supabase
                .from('votes')
                .select('*')
                .eq('poll_id', id)
            if (votesData) setVotes(votesData)

        } catch (error: any) {
            console.error('Error voting:', error)
            alert('Gagal memberikan vote.')
        } finally {
            setVoting(false)
        }
    }

    const getVoteCount = (optionId: string) => {
        return votes.filter(v => v.option_id === optionId).length
    }

    const getTotalVotes = () => {
        return votes.length
    }

    const getPercentage = (optionId: string) => {
        const total = getTotalVotes()
        if (total === 0) return 0
        return Math.round((getVoteCount(optionId) / total) * 100)
    }

    const getChartData = () => {
        return options.map(option => ({
            name: option.option_text.length > 20
                ? option.option_text.substring(0, 20) + '...'
                : option.option_text,
            votes: getVoteCount(option.id),
            percentage: getPercentage(option.id),
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (!poll) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Poll tidak ditemukan</h2>
                    <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative">
            {/* Header */}
            <header className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/dashboard" className="flex items-center gap-2 w-fit hover:opacity-75 transition-opacity">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">Kembali ke Dashboard</span>
                    </Link>

                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share Poll
                    </button>
                </div>
            </header>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl transform scale-100 transition-all">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Polling Siap!</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Polling berhasil dibuat. Bagikan link ini ke teman-temanmu untuk mulai voting.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                            <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Link Polling</p>
                            <div className="flex items-center gap-2 break-all text-sm font-mono text-gray-600 dark:text-gray-400">
                                {window.location.href.split('?')[0]}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleShare}
                                className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Tersalin!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        Salin Link
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    {/* Poll Header */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{poll.title}</h1>
                                {poll.description && (
                                    <p className="text-gray-600 dark:text-gray-300">{poll.description}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${poll.is_active
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {poll.is_active ? '🟢 Aktif' : '⚫ Selesai'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${poll.visibility === 'public'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                    }`}>
                                    {poll.visibility === 'public' ? 'Public' : 'Shared Link'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="font-medium text-lg">{getTotalVotes()} Total Votes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{new Date(poll.created_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Voting Section */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                                {userVote ? 'Hasil Voting' : (poll.auth_type === 'ip' ? 'Vote via IP (Tanpa Login)' : 'Pilih Opsi Kamu')}
                            </h2>

                            {userVote && (
                                <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                                    <p className="text-green-600 dark:text-green-400 text-sm">
                                        ✓ Kamu sudah memberikan vote!
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {options.map((option, index) => {
                                    const voteCount = getVoteCount(option.id)
                                    const percentage = getPercentage(option.id)
                                    const isUserVote = userVote?.option_id === option.id

                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleVote(option.id)}
                                            disabled={!!userVote || voting || !poll.is_active}
                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${isUserVote
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                : userVote
                                                    ? 'border-gray-300 dark:border-gray-600 cursor-default'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 hover:shadow-md cursor-pointer'
                                                } ${!poll.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {/* Progress Bar Background */}
                                            {userVote && (
                                                <div
                                                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            )}

                                            <div className="relative flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isUserVote
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                        }`} style={{ backgroundColor: userVote ? COLORS[index % COLORS.length] : undefined }}>
                                                        {String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {option.option_text}
                                                    </span>
                                                </div>
                                                {userVote && (
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-gray-800 dark:text-white">
                                                            {percentage}%
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {voteCount} votes
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Visualisasi Real-time</h2>

                            {getTotalVotes() > 0 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={getChartData()}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="votes" name="Jumlah Vote" radius={[8, 8, 0, 0]}>
                                            {getChartData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[400px] flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                                            Belum ada vote
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                            Jadilah yang pertama memberikan vote!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
