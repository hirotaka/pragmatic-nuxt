type PathConfig = {
  path: string
  getHref: (...args: string[]) => string
}

type AuthPaths = {
  login: PathConfig
  register: PathConfig
}

type AppPaths = {
  root: PathConfig
  dashboard: PathConfig
  discussions: PathConfig
  discussion: PathConfig
  profile: PathConfig
  users: PathConfig
}

type Paths = {
  home: PathConfig
  auth: AuthPaths
  app: AppPaths
}

export const paths: Paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  auth: {
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    register: {
      path: '/auth/register',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },
  app: {
    root: {
      path: '/app',
      getHref: () => '/app',
    },
    dashboard: {
      path: '',
      getHref: () => '/app',
    },
    discussions: {
      path: 'discussions',
      getHref: () => '/app/discussions',
    },
    discussion: {
      path: 'discussions/:discussionId',
      getHref: (id: string) => `/app/discussions/${id}`,
    },
    profile: {
      path: 'profile',
      getHref: () => '/app/profile',
    },
    users: {
      path: 'users',
      getHref: () => '/app/users',
    },
  },
}
