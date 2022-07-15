import { createRouter } from './context'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const questionRouter = createRouter()
	.mutation('ask-question', {
		input: z.object({
			user_id: z.string(),
			question: z.string().min(5).max(255),
		}),
		async resolve({ ctx, input }) {
			const res = await ctx.prisma.questions.create({
				data: { question: input.question, user_id: input.user_id },
			})
			return res
		},
	})
	.query('get-pinned-question', {
		input: z.object({ id: z.string() }).nullish(),
		async resolve({ ctx, input }) {
			const res = await ctx.prisma.pins.findFirst({
				where: { user_id: input?.id ? input.id : ctx.session.user?.id },
				select: { question: true },
			})
			return res
		},
	})
	// past this point all the routes are protected
	.middleware(async ({ ctx, next }) => {
		if (!ctx.session || !ctx.session.user?.id) {
			throw new TRPCError({ code: 'UNAUTHORIZED' })
		}
		return next({
			ctx: {
				...ctx,
				session: {
					...ctx.session,
					user: ctx.session.user,
				},
			},
		})
	})
	.query('get-questions', {
		async resolve({ ctx }) {
			const res = await ctx.prisma.questions.findMany({
				where: {
					user_id: ctx.session.user.id,
				},
			})
			return res
		},
	})
	.mutation('delete-question', {
		input: z.object({ id: z.string() }),
		async resolve({ ctx, input }) {
			const res = await ctx.prisma.questions.delete({
				where: {
					id: input.id,
				},
			})
			return res
		},
	})
	.mutation('pin-question', {
		input: z.object({ question: z.string().nullish(), action: z.string().nullish() }),
		async resolve({ ctx, input }) {
			if (input.action === 'unpin') {
				const res = await ctx.prisma.pins.upsert({
					where: { user_id: ctx.session.user.id },
					update: { question: '' },
					create: { user_id: ctx.session.user.id, question: '' },
				})
				return res
			} else if (input.question) {
				const res = await ctx.prisma.pins.upsert({
					where: { user_id: ctx.session.user.id },
					update: { question: input.question },
					create: { user_id: ctx.session.user.id, question: input.question },
				})
				return res
			} else {
				return new TRPCError({ code: 'BAD_REQUEST' })
			}
		},
	})
