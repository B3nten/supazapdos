import { Nav } from '@src/modules/components/nav'
import { trpc } from '@src/utils/trpc'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { FaTrash } from 'react-icons/fa'
import { BsFillPinAngleFill, BsClipboard } from 'react-icons/bs'
import { useQueryClient } from 'react-query'
import { useEffect, useState } from 'react'
import supabase, { useSession } from '@src/modules/supabase'
import { questions } from '@prisma/client'
import { useRouter } from 'next/router'

export default function Answer() {
	const client = useQueryClient()
	const session = useSession()
	const router = useRouter()

	const [animate] = useAutoAnimate<any>()

	const [questions, setQuestions] = useState<questions[]>([])
	const [pinned, setPinned] = useState<any>('')

	const initialQuestions = trpc.useQuery(['question.get-questions'], {
		onSuccess: data => {
			setQuestions(data)
		},
	})

	trpc.useQuery(['question.get-pinned-question'], {
		onSuccess: data => {
			setPinned(data?.question)
		},
	})
	const pinQuestion = trpc.useMutation('question.pin-question', {
		onSuccess: data => {
			//@ts-ignore
			setPinned(data.question)
		},
	})
	const deleteQuestion = trpc.useMutation('question.delete-question', {
		onSuccess: data => {
			//@ts-ignore
			client.setQueryData(['question.get-questions'], oldData => {
				//@ts-ignore
				return oldData.filter(question => question.id !== data.id)
			})
		},
	})

	useEffect(() => {
		const questions = supabase
			.from(`questions:user_id=eq.${session?.user?.id}`)
			.on('*', payload => {
				setQuestions(old => [...old, payload.new])
			})
			.subscribe()
		console.log(questions)

		return () => {
			questions.unsubscribe()
		}
	}, [session?.user?.id])

	if (initialQuestions.isLoading) return <div>loading..</div>
	if (initialQuestions.isError) return <div>{initialQuestions.error.message}</div>
	if (!initialQuestions.data || !questions) return <div>no questions</div>

	async function copyEmbed() {
		const url = window.location.hostname + '/embed/' + session?.user?.id
		navigator.clipboard.writeText(url)
	}

	async function copyAsk() {
		const url = window.location.hostname + '/ask/' + session?.user?.user_metadata.slug
		navigator.clipboard.writeText(url)
	}

	return (
		<>
			<Nav />
			<ul ref={animate} className='w-full max-w-3xl mx-auto my-10 flex flex-col space-y-4'>
				<div className='flex space-x-4'>
					<button onClick={copyAsk} className='btn btn-sm btn-accent'>
						Copy ask link <BsClipboard className='ml-2' />
					</button>
					<button onClick={copyEmbed} className='btn btn-sm btn-accent'>
						Copy embed link <BsClipboard className='ml-2' />
					</button>
				</div>
				<div className='bg-secondary p-5 rounded-xl text-lg flex items-center justify-between space-x-4 mb-10 h-32'>
					<BsFillPinAngleFill className='text-3xl' />
					<span>{pinned}</span>
					<button
						onClick={() => pinQuestion.mutate({ action: 'unpin' })}
						className={`btn btn-sm btn-accent ${
							pinQuestion.isLoading && 'pointer-events-none'
						} ${pinned.length === 0 && 'opacity-0'}`}>
						Clear
					</button>
				</div>
				{questions
					.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
					.map(q => (
						<li
							key={q.id}
							className='bg-primary p-5 rounded-xl text-lg flex justify-between items-center space-x-4'>
							<span className='inline-block break-all'>{q.question}</span>
							<span className='flex space-x-2'>
								<button
									onClick={() => deleteQuestion.mutate({ id: q.id })}
									className={`btn btn-circle btn-accent btn-sm `}>
									<FaTrash />
								</button>
								<button
									onClick={() => {
										pinQuestion.mutate({ question: q.question })
									}}
									className={`btn btn-circle btn-accent btn-sm ${
										pinQuestion.isLoading && 'pointer-events-none'
									}`}>
									<BsFillPinAngleFill />
								</button>
							</span>
						</li>
					))}
			</ul>
		</>
	)
}
