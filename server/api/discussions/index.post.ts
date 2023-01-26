import type { H3Event } from 'h3'
import { requireAuth, requireAdmin } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma } = event.context

  const user = requireAuth(event)

  requireAdmin(user)

  const body = await readBody(event)
  const data = prisma.discussion.create({
    data: {
      ...body,
      teamId: user.teamId
    }
  })

  return data
})
