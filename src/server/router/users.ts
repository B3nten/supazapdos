import { createRouter } from './context'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const userRouter = createRouter()
	.mutation('upsert', {
		async resolve({ ctx }) {
			if (ctx.session.user?.id) {
				const res = await ctx.prisma.users.upsert({
					where: { id: ctx.session.user.id },
					update: {
						id: ctx.session.user.id,
						slug: ctx.session.user.user_metadata.slug,
						nickname: ctx.session.user.user_metadata.nickname,
						picture: ctx.session.user.user_metadata.picture,
					},
					create: {
						id: ctx.session.user.id,
						slug: ctx.session.user.user_metadata.slug,
						nickname: ctx.session.user.user_metadata.nickname,
						picture: ctx.session.user.user_metadata.picture,
					},
				})
				return res
			} else {
				return new TRPCError({ message: 'User not found', code: 'UNAUTHORIZED' })
			}
		},
	})
	.query('get-user', {
		input: z.object({ user_slug: z.string() }),
		async resolve({ ctx, input }) {
			const user = await ctx.prisma.users.findFirst({
				where: { slug: input.user_slug },
			})
			return user
		},
	})
