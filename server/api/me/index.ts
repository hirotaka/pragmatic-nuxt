import type { H3Event } from 'h3'
import { requireAuth } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma } = event.context

  const user = requireAuth(event)

  const me = await prisma.user.findFirst({
    where: {
      id: user.id
    }
  })

  return me
})
