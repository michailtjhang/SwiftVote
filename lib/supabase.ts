import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type Poll = {
    id: string
    title: string
    description: string
    created_by: string
    created_at: string
    ends_at: string | null
    is_active: boolean
    visibility: 'public' | 'shared'
    auth_type: 'account' | 'ip'
}

export type PollOption = {
    id: string
    poll_id: string
    option_text: string
    created_at: string
}

export type Vote = {
    id: string
    poll_id: string
    option_id: string
    user_id: string | null
    ip_address: string | null
    created_at: string
}
