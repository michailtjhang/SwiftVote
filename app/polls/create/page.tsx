'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatePollPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [options, setOptions] = useState(['', ''])
    const [visibility, setVisibility] = useState<'public' | 'shared'>('public')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, ''])
        }
    }

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index))
        }
    }

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validation
        if (!title.trim()) {
            setError('Judul polling tidak boleh kosong')
            setLoading(false)
            return
        }

        const validOptions = options.filter(opt => opt.trim() !== '')
        if (validOptions.length < 2) {
            setError('Minimal 2 opsi diperlukan')
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // Create poll
            const { data: pollData, error: pollError } = await supabase
                .from('polls')
                .insert({
                    title: title.trim(),
                    description: description.trim(),
                    created_by: user.id,
                    is_active: true,
                    visibility: visibility,
                    auth_type: visibility === 'public' ? 'account' : 'ip'
                })
                .select()
                .single()

            if (pollError) throw pollError

            // Create poll options
            const optionsData = validOptions.map(option => ({
                poll_id: pollData.id,
                option_text: option.trim(),
            }))

            const { error: optionsError } = await supabase
                .from('poll_options')
                .insert(optionsData)

            if (optionsError) throw optionsError

            router.push(`/polls/${pollData.id}?new=true`)
        } catch (err: any) {
            setError(err.message || 'Gagal membuat polling')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
            {/* Header */}
            <header className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/dashboard" className="flex items-center gap-2 w-fit">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">Kembali ke Dashboard</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Buat Poll Baru</h1>
                        <p className="text-gray-600 dark:text-gray-300">Buat polling dan dapatkan feedback real-time</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Title */}
                        <div className="mb-6">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Judul Polling *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Apa pertanyaan polling kamu?"
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Deskripsi (opsional)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                placeholder="Tambahkan deskripsi atau konteks..."
                            />
                        </div>

                        {/* Options */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Opsi Jawaban *
                            </label>
                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(index, e.target.value)}
                                            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder={`Opsi ${index + 1}`}
                                        />
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="px-4 py-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {options.length < 10 && (
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="mt-3 w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                >
                                    + Tambah Opsi
                                </button>
                            )}
                        </div>



                        {/* Visibility Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                Tipe Polling *
                            </label>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => setVisibility('public')}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${visibility === 'public'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${visibility === 'public' ? 'border-indigo-500' : 'border-gray-400'
                                            }`}>
                                            {visibility === 'public' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                                        </div>
                                        <span className="font-bold text-gray-800 dark:text-white">Public (Login)</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                                        Muncul di halaman utama. Voter harus login (1 Akun = 1 Suara).
                                    </p>
                                </div>

                                <div
                                    onClick={() => setVisibility('shared')}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${visibility === 'shared'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${visibility === 'shared' ? 'border-indigo-500' : 'border-gray-400'
                                            }`}>
                                            {visibility === 'shared' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                                        </div>
                                        <span className="font-bold text-gray-800 dark:text-white">Shared Link (IP)</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                                        Hanya via link. Tanpa login (1 IP Address = 1 Suara).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Membuat...' : 'Buat Polling'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
