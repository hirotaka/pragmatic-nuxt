import Cookies from 'js-cookie'
import { http, HttpResponse } from 'msw'

import { db, persistDb } from '../db'
import { hash } from '../utils'

import type { AuthResponse, User } from '@/types/api'

const AUTH_COOKIE = 'auth-token'

type LoginBody = {
  email: string
  password: string
}

type RegisterBody = {
  email: string
  password: string
  firstName: string
  lastName: string
  teamId?: string
  teamName?: string
}

const getCurrentUser = (request: Request): User | null => {
  const cookies = request.headers.get('cookie') || ''
  const authToken =
    cookies
      .split(';')
      .find((c) => c.trim().startsWith(`${AUTH_COOKIE}=`))
      ?.split('=')[1] || Cookies.get(AUTH_COOKIE)

  if (!authToken) return null

  try {
    const decoded = JSON.parse(atob(authToken))
    const user = db.user.findFirst({
      where: {
        id: {
          equals: decoded.id,
        },
      },
    })
    return user ? ({ ...user, password: undefined } as User) : null
  } catch {
    return null
  }
}

export const authHandlers = [
  // POST /auth/login
  http.post('/auth/login', async ({ request }) => {
    try {
      const credentials = (await request.json()) as LoginBody

      const user = db.user.findFirst({
        where: {
          email: {
            equals: credentials.email,
          },
        },
      })

      if (!user) {
        return HttpResponse.json({ message: 'Invalid username or password' }, { status: 401 })
      }

      // Verify the password hash
      if (user.password !== hash(credentials.password)) {
        return HttpResponse.json({ message: 'Invalid username or password' }, { status: 401 })
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user

      const result: AuthResponse = {
        jwt: btoa(JSON.stringify({ id: user.id })),
        user: userWithoutPassword as User,
      }

      // Set cookie using js-cookie for browser environment
      Cookies.set(AUTH_COOKIE, result.jwt, { path: '/' })

      return HttpResponse.json(result, {
        headers: {
          'Set-Cookie': `${AUTH_COOKIE}=${result.jwt}; Path=/;`,
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return HttpResponse.json({ message: 'An error occurred during login' }, { status: 500 })
    }
  }),

  // POST /auth/register
  http.post('/auth/register', async ({ request }) => {
    try {
      const data = (await request.json()) as RegisterBody

      // Check if user already exists
      const existingUser = db.user.findFirst({
        where: {
          email: {
            equals: data.email,
          },
        },
      })

      if (existingUser) {
        return HttpResponse.json(
          { message: 'User with this email already exists' },
          { status: 400 },
        )
      }

      // Create or find team
      let teamId
      let role

      if (!data.teamId) {
        // Create new team - user becomes ADMIN
        const team = db.team.create({
          name: data.teamName ?? `${data.firstName} Team`,
        })
        await persistDb('team')
        teamId = team.id
        role = 'ADMIN'
      } else {
        // Join existing team - user becomes USER
        const existingTeam = db.team.findFirst({
          where: {
            id: {
              equals: data.teamId,
            },
          },
        })

        if (!existingTeam) {
          return HttpResponse.json(
            {
              message: 'The team you are trying to join does not exist!',
            },
            { status: 400 },
          )
        }
        teamId = data.teamId
        role = 'USER'
      }

      // Create user
      const user = db.user.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hash(data.password),
        teamId,
        role,
        bio: '',
      })

      await persistDb('user')

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user

      const result: AuthResponse = {
        jwt: btoa(JSON.stringify({ id: user.id })),
        user: userWithoutPassword as User,
      }

      // Set cookie using js-cookie for browser environment
      Cookies.set(AUTH_COOKIE, result.jwt, { path: '/' })

      return HttpResponse.json(result, {
        status: 201,
        headers: {
          'Set-Cookie': `${AUTH_COOKIE}=${result.jwt}; Path=/;`,
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return HttpResponse.json(
        { message: 'An error occurred during registration' },
        { status: 500 },
      )
    }
  }),

  // GET /auth/me
  http.get('/auth/me', async ({ request }) => {
    const user = getCurrentUser(request)

    // Return null data instead of 401 when not logged in
    // This matches bulletproof-react behavior
    return HttpResponse.json({ data: user })
  }),

  // POST /auth/logout
  http.post('/auth/logout', () => {
    // Remove cookie using js-cookie for browser environment
    Cookies.remove(AUTH_COOKIE)

    return HttpResponse.json(
      { message: 'Logged out successfully' },
      {
        headers: {
          'Set-Cookie': `${AUTH_COOKIE}=; Path=/; Max-Age=0`,
        },
      },
    )
  }),
]
