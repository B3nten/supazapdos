import { pins } from '@prisma/client'
import { useClientRouter } from '@src/common/hooks/useClientRouter'
import supabase from '@src/modules/supabase'
import { trpc } from '@src/utils/trpc'
import { useEffect, useState } from 'react'

export default function ID() {
	const router = useClientRouter()
	const [pinned, setPinned] = useState<pins>()

	const something = trpc.useQuery(
		['question.get-pinned-question', { id: router.query.id as string }],
		{
			onSuccess: (data: pins) => {
				setPinned(data)
			},
		}
	)

	useEffect(() => {
		const questions = supabase
			.from(`pins:user_id=eq.${router.query.id as string}`)
			.on('*', payload => {
				console.log(payload)
				setPinned(payload.new)
			})
			.subscribe()
		console.log(questions)

		return () => {
			questions.unsubscribe()
		}
	}, [])

	return (
		<div className='w-screen h-screen flex justify-center items-center'>
			<style>{css}</style>
			{pinned?.question && pinned.question.length > 0 && (
				<div className='bg-primary p-5 rounded-xl text-lg flex items-center justify-between'>
					{pinned?.question}
				</div>
			)}
		</div>
	)
}

const css = `
  :root {background-color: transparent;
  }`
