import type { H3Event } from 'h3'
import { requireAuth } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma } = event.context

  const user = requireAuth(event)

  const body = await readBody(event)

  const discussion = await prisma.discussion.findFirst({
    where: {
      id: body.discussionId,
      teamId: user.teamId
    }
  })

  if (!discussion) {
    return createError({
      statusCode: 404,
      statusMessage: 'Not found'
    })
  }

  const data = prisma.comment.create({
    data: {
      ...body,
      authorId: user.id
    }
  })

  return data
})
