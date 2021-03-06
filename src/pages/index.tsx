import { Nav } from '@src/modules/components/nav'
import supabase, { useSession } from '@src/modules/supabase'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ImTwitch } from 'react-icons/im'

const Home: NextPage = () => {
	const session = useSession()
	const router = useRouter()

	return (
		<>
			<Head>
				<title>Supazapdos - home</title>
			</Head>
			<Nav />
			<div className='w-full max-w-7xl mx-auto mt-32 flex flex-col items-center justify-center space-y-20'>
				<h1 className='text-4xl text-center'>✨ Supabase ✨ {'>>>'} 👎 Railway + Pusher 🗑️</h1>
				{session && (
					<button onClick={() => router.push('/answer')} className='btn btn-primary btn-wide'>
						View questions
					</button>
				)}
			</div>
		</>
	)
}

export default Home
