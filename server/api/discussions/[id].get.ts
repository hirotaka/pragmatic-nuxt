import type { H3Event } from 'h3'
import { requireAuth } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma, params } = event.context

  const user = requireAuth(event)

  const discussion = await prisma.discussion.findFirst({
    where: {
      id: params?.id,
      teamId: user.teamId
    }
  })

  if (!discussion) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  return discussion
})
