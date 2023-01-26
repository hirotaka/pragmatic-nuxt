import { H3Event } from 'h3'
import { requireAuth, requireAdmin } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma, params } = event.context

  const user = requireAuth(event)
  requireAdmin(user)

  const id = params?.id as string

  const body = await readBody(event)
  const discussion = prisma.discussion.update({
    where: {
      id_teamId: {
        id: id,
        teamId: user.teamId
      }
    },
    data: {
      ...body,
      teamId: user.teamId
    }
  })

  return discussion
})
