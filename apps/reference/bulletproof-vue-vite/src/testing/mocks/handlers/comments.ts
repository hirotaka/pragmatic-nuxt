import Cookies from 'js-cookie'
import { http, HttpResponse } from 'msw'

import { db, persistDb } from '../db'

import type { Comment, User } from '@/types/api'

const AUTH_COOKIE = 'auth-token'
const COMMENTS_PER_PAGE = 10

type CreateCommentBody = {
  body: string
  discussionId: string
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

export const commentsHandlers = [
  // GET /comments?discussionId=:id
  http.get('/comments', async ({ request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const discussionId = url.searchParams.get('discussionId')
    const page = parseInt(url.searchParams.get('page') || '1', 10)

    if (!discussionId) {
      return HttpResponse.json({ message: 'Discussion ID is required' }, { status: 400 })
    }

    // Verify discussion exists and user has access
    const discussion = db.discussion.findFirst({
      where: {
        id: {
          equals: discussionId,
        },
      },
    })

    if (!discussion) {
      return HttpResponse.json({ message: 'Discussion not found' }, { status: 404 })
    }

    if (discussion.teamId !== user.teamId) {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Get all comments for the discussion
    const allComments = db.comment
      .findMany({
        where: {
          discussionId: {
            equals: discussionId,
          },
        },
      })
      .sort((a, b) => b.createdAt - a.createdAt)

    const total = allComments.length
    const totalPages = Math.ceil(total / COMMENTS_PER_PAGE)

    // For infinite scroll, return based on page
    const start = (page - 1) * COMMENTS_PER_PAGE
    const end = start + COMMENTS_PER_PAGE

    const paginatedComments = allComments.slice(start, end)

    // Populate author information
    const commentsWithAuthor = paginatedComments.map((comment) => {
      const author = db.user.findFirst({
        where: {
          id: {
            equals: comment.authorId,
          },
        },
      })

      if (!author) {
        return {
          id: comment.id,
          body: comment.body,
          discussionId: comment.discussionId,
          author: {} as User,
          createdAt: comment.createdAt,
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...authorWithoutPassword } = author

      const commentWithAuthor: Comment = {
        id: comment.id,
        body: comment.body,
        discussionId: comment.discussionId,
        author: authorWithoutPassword as User,
        createdAt: comment.createdAt,
      }

      return commentWithAuthor
    })

    return HttpResponse.json({
      data: commentsWithAuthor,
      meta: {
        page,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    })
  }),

  // POST /comments
  http.post('/comments', async ({ request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
      const data = (await request.json()) as CreateCommentBody

      // Verify discussion exists and user has access
      const discussion = db.discussion.findFirst({
        where: {
          id: {
            equals: data.discussionId,
          },
        },
      })

      if (!discussion) {
        return HttpResponse.json({ message: 'Discussion not found' }, { status: 404 })
      }

      if (discussion.teamId !== user.teamId) {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }

      const comment = db.comment.create({
        body: data.body,
        discussionId: data.discussionId,
        authorId: user.id,
      })

      await persistDb('comment')

      const commentWithAuthor: Comment = {
        id: comment.id,
        body: comment.body,
        discussionId: comment.discussionId,
        author: user,
        createdAt: comment.createdAt,
      }

      return HttpResponse.json({ data: commentWithAuthor }, { status: 201 })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return HttpResponse.json(
        { message: 'An error occurred while creating comment' },
        { status: 500 },
      )
    }
  }),

  // DELETE /comments/:id
  http.delete('/comments/:id', async ({ request, params }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const comment = db.comment.findFirst({
      where: {
        id: {
          equals: id as string,
        },
      },
    })

    if (!comment) {
      return HttpResponse.json({ message: 'Comment not found' }, { status: 404 })
    }

    // Verify user has access to the discussion
    const discussion = db.discussion.findFirst({
      where: {
        id: {
          equals: comment.discussionId,
        },
      },
    })

    if (!discussion) {
      return HttpResponse.json({ message: 'Discussion not found' }, { status: 404 })
    }

    if (discussion.teamId !== user.teamId) {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Check if user is the author or admin
    if (comment.authorId !== user.id && user.role !== 'ADMIN') {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    db.comment.delete({
      where: {
        id: {
          equals: id as string,
        },
      },
    })

    await persistDb('comment')

    return HttpResponse.json({ message: 'Comment deleted successfully' })
  }),
]
