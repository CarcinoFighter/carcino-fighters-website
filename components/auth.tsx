"use client"
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/initSupabase'

export default function AuthComponent() {
    return (
        <Auth

            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['github', 'google']} // Optional: add providers
        />
    )
}