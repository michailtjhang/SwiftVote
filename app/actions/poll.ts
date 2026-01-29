'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                    }
                },
            },
        }
    )
}

export async function deletePoll(pollId: string) {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return { error: 'Unauthorized' }

    // Check ownership
    const { data: poll } = await supabase
        .from('polls')
        .select('created_by')
        .eq('id', pollId)
        .single()

    if (!poll) return { error: 'Poll not found' }
    if (poll.created_by !== session.user.id) return { error: 'You are not the owner' }

    // Delete (cascade should handle votes/options if configured, otherwise we delete manually)
    // Assuming cascade is ON for poll_options and votes
    const { error } = await supabase.from('polls').delete().eq('id', pollId)

    if (error) return { error: error.message }
    return { success: true }
}

export async function updatePoll(pollId: string, updates: {
    title?: string,
    description?: string,
    is_active?: boolean,
    ends_at?: string | null
}) {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return { error: 'Unauthorized' }

    // Check ownership
    const { data: poll } = await supabase
        .from('polls')
        .select('created_by')
        .eq('id', pollId)
        .single()

    if (!poll) return { error: 'Poll not found' }
    if (poll.created_by !== session.user.id) return { error: 'You are not the owner' }

    const { error } = await supabase
        .from('polls')
        .update(updates)
        .eq('id', pollId)

    if (error) return { error: error.message }
    return { success: true }
}
