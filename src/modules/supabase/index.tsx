import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createContext, useEffect, useState, useContext } from 'react'
import { Session } from '@supabase/gotrue-js/src/lib/types'
import { trpc } from '@src/utils/trpc'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const token = process.env.NEXT_PUBLIC_SUPABASE_ANON as string
const supabase = createClient(url, token)

export default supabase

const supabaseContext = createContext<Session | null>(null)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null)
	const upsertUser = trpc.useMutation('users.upsert')

	useEffect(() => {
		setSession(supabase.auth.session())
		const unsubscribe = supabase.auth.onAuthStateChange(async (event, session) => {
			setSession(session)
			if (event == 'SIGNED_IN') {
				upsertUser.mutate()
			}
			await fetch('/api/auth/cookie', {
				method: 'POST',
				headers: new Headers({ 'Content-Type': 'application/json' }),
				credentials: 'same-origin',
				body: JSON.stringify({ event, session }),
			})
		})

		return () => {
			if (unsubscribe.data) unsubscribe.data.unsubscribe()
		}
	}, [])
	return <supabaseContext.Provider value={session}>{children}</supabaseContext.Provider>
}

export function useSession() {
	const session = useContext(supabaseContext)
	return session
}
