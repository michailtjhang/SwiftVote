'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePoll } from '@/app/actions/poll'
import type { Poll } from '@/lib/supabase'

export default function EditPollPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [endsAt, setEndsAt] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchPoll()
    }, [id])

    const fetchPoll = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }

            const { data, error } = await supabase
                .from('polls')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            if (data.created_by !== user.id) {
                router.push('/dashboard')
                return
            }

            setTitle(data.title)
            setDescription(data.description)
            setIsActive(data.is_active)
            // Convert ISO string to YYYY-MM-DDTHH:mm for input datetime-local
            if (data.ends_at) {
                const date = new Date(data.ends_at)
                // Adjust for local timezone offset manually or just use substring if it was UTC
                // Actually input datetime-local expects local time, so:
                const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
                setEndsAt(localIso)
            } else {
                setEndsAt('')
            }
            setLoading(false)
        } catch (err) {
            console.error(err)
            router.push('/dashboard')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const result = await updatePoll(id, {
                title,
                description,
                is_active: isActive,
                ends_at: endsAt ? new Date(endsAt).toISOString() : null
            })

            if (result.error) throw new Error(result.error)

            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Gagal mengupdate poll')
            setSaving(false)
        }
    }

    if (loading) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
            <header className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/dashboard" className="flex items-center gap-2 w-fit">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">Batal & Kembali</span>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Edit Polling</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Judul</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsi</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white resize-none"
                            />
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                <select
                                    value={isActive ? 'true' : 'false'}
                                    onChange={(e) => setIsActive(e.target.value === 'true')}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                                >
                                    <option value="true">🟢 Aktif</option>
                                    <option value="false">⚫ Ditutup</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Berakhir Pada (Opsional)</label>
                                <input
                                    type="datetime-local"
                                    value={endsAt}
                                    onChange={(e) => setEndsAt(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 mb-6">
                            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                                ⚠️ Opsi jawaban tidak dapat diedit setelah polling dibuat untuk menjaga integritas data voting.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full px-6 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
