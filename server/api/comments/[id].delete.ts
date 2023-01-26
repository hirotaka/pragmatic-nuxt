import type { H3Event } from 'h3'
import { requireAuth } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma, params } = event.context

  const user = requireAuth(event)

  const id = params?.id

  await prisma.comment.deleteMany({
    where: {
      id,
      authorId: user.id
    }
  })

  return id
})
