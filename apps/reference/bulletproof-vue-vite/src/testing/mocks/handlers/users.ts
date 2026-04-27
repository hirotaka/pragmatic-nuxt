import Cookies from 'js-cookie'
import { http, HttpResponse } from 'msw'

import { db, persistDb } from '../db'

import type { User } from '@/types/api'

const AUTH_COOKIE = 'auth-token'

type UpdateProfileBody = {
  firstName?: string
  lastName?: string
  email?: string
  bio?: string
}

const getCurrentUser = (request: Request) => {
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

export const usersHandlers = [
  // GET /users (admin only)
  http.get('/users', async ({ request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Get all users from the same team
    const users = db.user
      .findMany({
        where: {
          teamId: {
            equals: user.teamId,
          },
        },
      })
      .sort((a, b) => b.createdAt - a.createdAt)

    // Remove passwords
    const usersWithoutPasswords = users.map((u) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = u
      return userWithoutPassword as User
    })

    return HttpResponse.json({
      data: usersWithoutPasswords,
    })
  }),

  // PATCH /profile
  http.patch('/profile', async ({ request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
      const updates = (await request.json()) as UpdateProfileBody

      // If email is being updated, check if it's already taken
      if (updates.email && updates.email !== user.email) {
        const existingUser = db.user.findFirst({
          where: {
            email: {
              equals: updates.email,
            },
          },
        })

        if (existingUser) {
          return HttpResponse.json({ message: 'Email is already taken' }, { status: 400 })
        }
      }

      const updatedUser = db.user.update({
        where: {
          id: {
            equals: user.id,
          },
        },
        data: updates,
      })

      if (!updatedUser) {
        return HttpResponse.json({ message: 'Failed to update profile' }, { status: 500 })
      }

      await persistDb('user')

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = updatedUser

      return HttpResponse.json({ data: userWithoutPassword as User })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return HttpResponse.json(
        { message: 'An error occurred while updating profile' },
        { status: 500 },
      )
    }
  }),

  // DELETE /users/:id (admin only)
  http.delete('/users/:id', async ({ request, params }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id } = params

    // Prevent self-deletion
    if (id === user.id) {
      return HttpResponse.json({ message: 'You cannot delete your own account' }, { status: 400 })
    }

    const targetUser = db.user.findFirst({
      where: {
        id: {
          equals: id as string,
        },
      },
    })

    if (!targetUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if target user is in the same team
    if (targetUser.teamId !== user.teamId) {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    db.user.delete({
      where: {
        id: {
          equals: id as string,
        },
      },
    })

    await persistDb('user')

    // Optionally, delete user's discussions and comments
    // For now, we'll leave them but they'll show as orphaned
    // In a real app, you might want to handle this differently

    return HttpResponse.json({ message: 'User deleted successfully' })
  }),
]
