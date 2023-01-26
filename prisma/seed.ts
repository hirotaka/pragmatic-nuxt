import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const main = async () => {
  const teamId = 'Dkd5_DX_P0nv1fDyMDpfm'

  await prisma.team.delete({ where: { id: teamId } }).catch((e) => {
    // eslint-disable-next-line no-console
    console.log(e)
  })

  const team = await prisma.team.create({
    data: {
      id: teamId,
      name: 'Team1'
    }
  })

  const email = 'user1@example.com'

  await prisma.user.delete({ where: { email } }).catch(() => {})

  const hashedPassword = await bcrypt.hash('password', 10)

  await prisma.user.create({
    data: {
      email,
      id: 'KAvRwEn_d-MkAWmOctLbV',
      password: {
        create: {
          hash: hashedPassword
        }
      },
      bio: 'Admin',
      firstName: 'John',
      lastName: 'Smith',
      role: 'ADMIN',
      teamId: team.id
    }
  })

  await prisma.user.create({
    data: {
      email: 'user2@example.com',
      id: 'id2',
      password: {
        create: {
          hash: hashedPassword
        }
      },
      bio: 'User',
      firstName: 'Fuga',
      lastName: 'Smith',
      role: 'USER',
      teamId: team.id
    }
  })

  // eslint-disable-next-line no-console
  console.log('Database has been seeded. 🌱')

  return Promise.resolve()
}

main()
  .catch((error: any) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
