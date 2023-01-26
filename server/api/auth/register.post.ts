import type { H3Event } from 'h3'
import { hash } from 'bcrypt'

export default eventHandler(async (event: H3Event) => {
  const { prisma } = event.context

  const body = await readBody(event)

  const existingUser = await prisma.user.findFirst({
    where: {
      email: body.email
    }
  })

  if (existingUser) {
    return createError({
      statusCode: 404,
      statusMessage: 'The user already exists'
    })
  }

  let teamId
  let role

  if (!body.teamId) {
    const team = await prisma.team.create({
      data: {
        name: body.teamName ?? `${body.firstName} Team`
      }
    })
    teamId = team.id
    role = 'ADMIN'
  } else {
    const existingTeam = prisma.team.findFirst({
      where: {
        id: body.teamId
      }
    })

    if (!existingTeam) {
      return createError({
        statusCode: 404,
        statusMessage: 'The team you are trying to join does not exist!'
      })
    }
    teamId = body.teamId
    role = 'USER'
  }

  const hashedPassword = await hash(body.password, 10)
  const data = await prisma.user.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role,
      password: {
        create: {
          hash: hashedPassword
        }
      },
      Team: {
        connect: { id: teamId }
      }
    }
  })

  return data
})
