import type { H3Event } from 'h3'
import { requireAdmin, requireAuth } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma, params } = event.context

  const user = requireAuth(event)
  requireAdmin(user)

  const id = params?.id
  await prisma.user.deleteMany({
    where: {
      id,
      teamId: user.teamId
    }
  })

  return id
})
