import type { H3Event } from 'h3'
import { requireAuth } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma } = event.context
  const params = getQuery(event)

  const discussionId: string | undefined = String(params.discussionId)

  const user = requireAuth(event)

  if (!discussionId) {
    return createError({
      statusCode: 404,
      statusMessage: 'Not found'
    })
  }

  const discussion = await prisma.discussion.findFirst({
    where: { id: discussionId, teamId: user.teamId }
  })

  if (!discussion) {
    return createError({
      statusCode: 404,
      statusMessage: 'Not found'
    })
  }

  const comments = await prisma.comment.findMany({
    where: { discussionId },
    select: {
      id: true,
      createdAt: true,
      body: true,
      discussionId: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return comments
})
