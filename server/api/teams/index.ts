import type { H3Event } from 'h3'

export default eventHandler(async (event: H3Event) => {
  const { prisma } = event.context

  const data = await prisma.team.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return data
})
