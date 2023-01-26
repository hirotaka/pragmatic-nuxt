import type { H3Event } from 'h3'
import { requireAuth } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma } = event.context

  const user = requireAuth(event)

  const discussions = await prisma.discussion.findMany({
    where: { teamId: user.teamId },
    select: { id: true, title: true },
    orderBy: { updatedAt: 'desc' }
  })

  return discussions
})
