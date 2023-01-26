import type { H3Event } from 'h3'
import { requireAuth } from '~/server/utils'

export default eventHandler(async (event: H3Event) => {
  const { prisma } = event.context

  const user = requireAuth(event)

  const { firstName, lastName, email, bio } = await readBody(event)
  const data = prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      firstName,
      lastName,
      email,
      bio
    }
  })

  return data
})
