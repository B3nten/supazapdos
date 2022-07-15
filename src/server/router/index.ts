// src/server/router/index.ts
import { createRouter } from './context'
import superjson from 'superjson'

import { questionRouter } from './question'
import { userRouter } from './users'

export const appRouter = createRouter()
	.transformer(superjson)
	.merge('question.', questionRouter)
	.merge('users.', userRouter)

// export type definition of API
export type AppRouter = typeof appRouter
