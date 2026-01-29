'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

async function createSupabaseServerClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

export async function castVote(pollId: string, optionId: string) {
    const supabase = await createSupabaseServerClient()

    // 1. Get Poll Info to determine Auth Type
    const { data: poll } = await supabase.from('polls').select('auth_type').eq('id', pollId).single()

    if (!poll) return { error: 'Poll not found' }

    // 2. Handle Account Based Voting
    if (poll.auth_type === 'account') {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return { error: 'Unauthorized' }

        const { error } = await supabase.from('votes').insert({
            poll_id: pollId,
            option_id: optionId,
            user_id: session.user.id
        })

        if (error) return { error: error.message }
        return { success: true }
    }

    // 3. Handle IP Based Voting
    if (poll.auth_type === 'ip') {
        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for') || 'unknown'

        // Simple IP check
        if (ip === 'unknown') {
            // Fallback for local dev if needed, or strict error
            // return { error: 'Could not determine IP' }
        }

        const { error } = await supabase.from('votes').insert({
            poll_id: pollId,
            option_id: optionId,
            ip_address: ip
        })

        if (error) {
            if (error.code === '23505') return { error: 'You have already voted' }
            return { error: error.message }
        }
        return { success: true }
    }
}

export async function getUserVoteStatus(pollId: string) {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    // 1. Check Account Vote
    if (session) {
        const { data } = await supabase.from('votes')
            .select('*')
            .eq('poll_id', pollId)
            .eq('user_id', session.user.id)
            .single()

        if (data) return { hasVoted: true, vote: data }
    }

    // 2. Check IP Vote
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'

    const { data: ipVote } = await supabase.from('votes')
        .select('*')
        .eq('poll_id', pollId)
        .eq('ip_address', ip)
        .single()

    if (ipVote) return { hasVoted: true, vote: ipVote }

    return { hasVoted: false, vote: null }
}
