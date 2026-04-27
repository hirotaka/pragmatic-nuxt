import Cookies from 'js-cookie'
import { http, HttpResponse } from 'msw'

import { db, persistDb } from '../db'

import type { Discussion, Meta, User } from '@/types/api'

const AUTH_COOKIE = 'auth-token'
const DISCUSSIONS_PER_PAGE = 10

type CreateDiscussionBody = {
  title: string
  body: string
}

type UpdateDiscussionBody = {
  title?: string
  body?: string
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

export const discussionsHandlers = [
  // GET /discussions
  http.get('/discussions', async ({ request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)

    // Get all discussions for user's team
    const allDiscussions = db.discussion
      .findMany({
        where: {
          teamId: {
            equals: user.teamId,
          },
        },
      })
      .sort((a, b) => b.createdAt - a.createdAt)

    const total = allDiscussions.length
    const totalPages = Math.ceil(total / DISCUSSIONS_PER_PAGE)
    const start = (page - 1) * DISCUSSIONS_PER_PAGE
    const end = start + DISCUSSIONS_PER_PAGE

    const paginatedDiscussions = allDiscussions.slice(start, end)

    // Populate author information
    const discussionsWithAuthor = paginatedDiscussions.map((discussion) => {
      const author = db.user.findFirst({
        where: {
          id: {
            equals: discussion.authorId,
          },
        },
      })

      if (!author) {
        return {
          ...discussion,
          author: {} as User,
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...authorWithoutPassword } = author

      return {
        ...discussion,
        author: authorWithoutPassword as User,
      }
    })

    const meta: Meta = {
      page,
      total,
      totalPages,
    }

    return HttpResponse.json({
      data: discussionsWithAuthor,
      meta,
    })
  }),

  // GET /discussions/:id
  http.get('/discussions/:id', async ({ request, params }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const discussion = db.discussion.findFirst({
      where: {
        id: {
          equals: id as string,
        },
      },
    })

    if (!discussion) {
      return HttpResponse.json({ message: 'Discussion not found' }, { status: 404 })
    }

    // Check if user has access to this discussion (same team)
    if (discussion.teamId !== user.teamId) {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Populate author information
    const author = db.user.findFirst({
      where: {
        id: {
          equals: discussion.authorId,
        },
      },
    })

    if (!author) {
      return HttpResponse.json({ message: 'Author not found' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...authorWithoutPassword } = author

    const discussionWithAuthor: Discussion = {
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      teamId: discussion.teamId,
      author: authorWithoutPassword as User,
      createdAt: discussion.createdAt,
    }

    return HttpResponse.json({ data: discussionWithAuthor })
  }),

  // POST /discussions
  http.post('/discussions', async ({ request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
      const data = (await request.json()) as CreateDiscussionBody

      const discussion = db.discussion.create({
        title: data.title,
        body: data.body,
        authorId: user.id,
        teamId: user.teamId,
      })

      await persistDb('discussion')

      const discussionWithAuthor: Discussion = {
        id: discussion.id,
        title: discussion.title,
        body: discussion.body,
        teamId: discussion.teamId,
        author: user,
        createdAt: discussion.createdAt,
      }

      return HttpResponse.json({ data: discussionWithAuthor }, { status: 201 })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return HttpResponse.json(
        { message: 'An error occurred while creating discussion' },
        { status: 500 },
      )
    }
  }),

  // PATCH /discussions/:id
  http.patch('/discussions/:id', async ({ request, params }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const discussion = db.discussion.findFirst({
      where: {
        id: {
          equals: id as string,
        },
      },
    })

    if (!discussion) {
      return HttpResponse.json({ message: 'Discussion not found' }, { status: 404 })
    }

    // Check if user is the author or admin
    if (discussion.authorId !== user.id && user.role !== 'ADMIN') {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    try {
      const updates = (await request.json()) as UpdateDiscussionBody

      const updatedDiscussion = db.discussion.update({
        where: {
          id: {
            equals: id as string,
          },
        },
        data: updates,
      })

      if (!updatedDiscussion) {
        return HttpResponse.json({ message: 'Failed to update discussion' }, { status: 500 })
      }

      await persistDb('discussion')

      const author = db.user.findFirst({
        where: {
          id: {
            equals: updatedDiscussion.authorId,
          },
        },
      })

      if (!author) {
        return HttpResponse.json({ message: 'Author not found' }, { status: 404 })
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...authorWithoutPassword } = author

      const discussionWithAuthor: Discussion = {
        id: updatedDiscussion.id,
        title: updatedDiscussion.title,
        body: updatedDiscussion.body,
        teamId: updatedDiscussion.teamId,
        author: authorWithoutPassword as User,
        createdAt: updatedDiscussion.createdAt,
      }

      return HttpResponse.json({ data: discussionWithAuthor })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return HttpResponse.json(
        { message: 'An error occurred while updating discussion' },
        { status: 500 },
      )
    }
  }),

  // DELETE /discussions/:id
  http.delete('/discussions/:id', async ({ request, params }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const discussion = db.discussion.findFirst({
      where: {
        id: {
          equals: id as string,
        },
      },
    })

    if (!discussion) {
      return HttpResponse.json({ message: 'Discussion not found' }, { status: 404 })
    }

    // Check if user is the author or admin
    if (discussion.authorId !== user.id && user.role !== 'ADMIN') {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    db.discussion.delete({
      where: {
        id: {
          equals: id as string,
        },
      },
    })

    await persistDb('discussion')

    // Also delete associated comments
    const comments = db.comment.findMany({
      where: {
        discussionId: {
          equals: id as string,
        },
      },
    })

    comments.forEach((comment) => {
      db.comment.delete({
        where: {
          id: {
            equals: comment.id,
          },
        },
      })
    })

    await persistDb('comment')

    return HttpResponse.json({ message: 'Discussion deleted successfully' })
  }),
]
