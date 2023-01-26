import type { H3Event } from 'h3'

export const requireAuth = (event: H3Event) => {
  const { user } = event.context

  if (!user) {
    return createError({
      statusCode: 404,
      statusMessage: 'Not found'
    })
  }

  return user
}

export const requireAdmin = (user: any) => {
  if (user.role !== 'ADMIN') {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
}
