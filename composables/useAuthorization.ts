import type { Comment, User } from '~/types'

export enum ROLES {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export type RoleTypes = keyof typeof ROLES

export const POLICIES = {
  'comment:delete': (user: User, comment: Comment) => {
    if (user.role === 'ADMIN') {
      return true
    }

    if (user.role === 'USER' && comment.authorId === user.id) {
      return true
    }

    return false
  }
}

export const useAuthorization = () => {
  const checkAccess = ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
    const { data } = useSession()
    const { user } = data.value as any

    if (!user) {
      throw new Error('User does not exist!')
    }

    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles?.includes(user?.role)
    }

    return true
  }

  return { checkAccess }
}
