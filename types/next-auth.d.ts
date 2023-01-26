import NextAuth from '@sidebase/nuxt-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      email: string
    }
  }
}
