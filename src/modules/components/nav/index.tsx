import { useRouter } from 'next/router'
import { useSession } from '@src/modules/supabase'
import { ImTwitch } from 'react-icons/im'
import supabase from '@src/modules/supabase'

export function Nav() {
	const session = useSession()
	const router = useRouter()

	async function signInWithTwitch() {
		await supabase.auth.signIn(
			{
				provider: 'twitch',
			},
			{ redirectTo: window.location.origin }
		)
	}
	return (
		<nav className='w-full max-w-7xl mx-auto p-2 flex justify-between'>
			<ul className='flex space-x-10 text-lg'></ul>
			{!session && (
				<button className='btn btn-primary space-x-2' onClick={signInWithTwitch}>
					<span className='text-lg'>Log in with Twitch </span>
					<ImTwitch className='text-2xl' />
				</button>
			)}
			{session && (
				<button
					className='btn btn-primary space-x-2 text-lg'
					onClick={() => {
						supabase.auth.signOut()
						router.push('/')
					}}>
					Sign out
				</button>
			)}
		</nav>
	)
}
