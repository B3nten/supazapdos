import { trpc } from '@src/utils/trpc'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { BallTriangle } from 'react-loader-spinner'

export default function Ask() {
	const router = useRouter()
	const user = trpc.useQuery(['users.get-user', { user_slug: router.query.slug as string }])
	const [question, setQuestion] = useState('')
	const submitQuestion = trpc.useMutation('question.ask-question')
	if (user.isLoading)
		return (
			<BallTriangle
				wrapperClass='w-full h-screen flex justify-center items-center'
				color='#FF7AC6'
			/>
		)
	if (!user.data || !user.data.id) return <div>User not found</div>
	return (
		<>
			<div className='w-full max-w-3xl mx-auto mt-32 flex flex-col space-y-4 p-2'>
				<img src={user.data?.picture ?? ''} className='w-20 h-20 rounded-full self-center' />
				{submitQuestion.isSuccess ? (
					<h1 className='text-4xl self-center'>Submitted successfully!</h1>
				) : (
					<h1 className='text-4xl self-center'>Ask {user.data?.nickname} a question:</h1>
				)}
				<textarea
					className={`input input-secondary h-32 text-2xl p-2 transition ${
						submitQuestion.isSuccess && 'scale-y-0'
					} ${submitQuestion.isError && 'input-error'}`}
					value={question}
					onChange={e => setQuestion(e.target.value)}
				/>
				<button
					className={`btn btn-wide btn-primary self-center transition ${
						submitQuestion.isLoading && 'btn-disabled'
					} ${submitQuestion.isSuccess && 'scale-y-0'} ${
						submitQuestion.isError && 'btn-error'
					}`}
					onClick={() => {
						submitQuestion.mutate({ user_id: user.data?.id as string, question: question })
						setQuestion('')
					}}>
					Submit
				</button>
			</div>
		</>
	)
}
