import type { H3Event } from 'h3'
import { requireAdmin, requireAuth } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma } = event.context

  const user = requireAuth(event)
  requireAdmin(user)

  const users = await prisma.user.findMany({
    where: { teamId: user.teamId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return users
})
