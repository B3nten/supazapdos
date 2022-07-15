// src/server/router/context.ts
import supabase from '@src/modules/supabase'
import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { prisma } from '../db/client'

export const createContext = async (opts?: trpcNext.CreateNextContextOptions) => {
	const req = opts?.req
	const res = opts?.res

	const session = await supabase.auth.api.getUserByCookie(req)

	return {
		req,
		res,
		prisma,
		session,
	}
}

type Context = trpc.inferAsyncReturnType<typeof createContext>

export const createRouter = () => trpc.router<Context>()
