import { compare } from 'bcrypt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { NuxtAuthHandler } from '#auth'

export default NuxtAuthHandler({
  secret: process.env.NUXT_SECRET,
  providers: [
    // @ts-ignore Import is exported on .default during SSR, so we need to call it this way. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      async authorize(credentials: any) {
        const prisma = new PrismaClient()
        const userWithPassword = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            password: true
          }
        })

        if (!userWithPassword || !userWithPassword.password) {
          return null
        }

        const isValid = await compare(
          credentials.password,
          userWithPassword.password.hash
        )

        if (isValid) {
          const { ...user } = userWithPassword
          return user
        } else {
          throw new Error('Incorrect Email or Password')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      const isSignIn = user ? true : false
      if (isSignIn) {
        token.jwt = user ? (user as any).access_token || '' : ''
        token.id = user ? user.id || '' : ''
        token.role = user ? (user as any).role || '' : ''
        token.teamId = user ? (user as any).teamId || '' : ''
      }
      return Promise.resolve(token)
    },
    session: async ({ session, token }: { session: any; token: any }) => {
      session.user = {
        id: token.id,
        role: token.role,
        teamId: token.teamId
      }

      return Promise.resolve(session)
    }
  }
})
