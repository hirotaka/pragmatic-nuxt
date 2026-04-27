import { useQueryClient } from '@tanstack/vue-query'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'

import { paths } from '@/config/paths'
import { getDiscussionQueryOptions } from '@/features/discussions/api/get-discussion'
import { getDiscussionsQueryOptions } from '@/features/discussions/api/get-discussions'
import { checkRole, type Role } from '@/lib/authorization'
import type { User } from '@/types/api'

const AUTH_USER_KEY = ['auth-user']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Restore scroll position when using browser back/forward buttons
    if (savedPosition) {
      return savedPosition
    }
    // Scroll to anchor if present
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    // Scroll to top on page transitions
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: paths.home.path,
      name: 'landing',
      component: () => import('@/pages/landing.vue'),
    },
    {
      path: paths.auth.login.path,
      name: 'login',
      component: () => import('@/pages/auth/login.vue'),
    },
    {
      path: paths.auth.register.path,
      name: 'register',
      component: () => import('@/pages/auth/register.vue'),
    },
    {
      path: paths.app.root.path,
      component: () => import('@/pages/app/root.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: paths.app.dashboard.path,
          name: 'dashboard',
          component: () => import('@/pages/app/dashboard.vue'),
        },
        {
          path: paths.app.discussions.path,
          name: 'discussions',
          component: () => import('@/pages/app/discussions/discussions.vue'),
        },
        {
          path: paths.app.discussion.path,
          name: 'discussion',
          component: () => import('@/pages/app/discussions/discussion.vue'),
        },
        {
          path: paths.app.profile.path,
          name: 'profile',
          component: () => import('@/pages/app/profile.vue'),
        },
        {
          path: paths.app.users.path,
          name: 'users',
          component: () => import('@/pages/app/users.vue'),
          meta: { requiresRole: 'ADMIN' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/not-found.vue'),
    },
  ],
})

// Extend route meta type
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresRole?: Role
  }
}

// Authentication and Authorization Guard
router.beforeEach(async (to: RouteLocationNormalized) => {
  const queryClient = useQueryClient()

  // Ensure user data is loaded before checking auth
  // This handles the case when the page is directly accessed/refreshed
  let user = queryClient.getQueryData<User | null>(AUTH_USER_KEY)

  // If no cached data, try to fetch it (will use existing query if in progress)
  if (user === undefined) {
    try {
      user = await queryClient.ensureQueryData({
        queryKey: AUTH_USER_KEY,
        queryFn: async () => {
          const { api } = await import('@/lib/api-client')
          const response: { data: User | null } = await api.get('/auth/me')
          return response.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
      })
    } catch {
      user = null
    }
  }

  const isAuthenticated = !!user

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login page with return URL
    return {
      name: 'login',
      query: { redirectTo: to.fullPath },
    }
  }

  // Check if route requires specific role
  if (to.meta.requiresRole && isAuthenticated && user) {
    if (!checkRole(user, to.meta.requiresRole)) {
      // Redirect to dashboard if user doesn't have required role
      return {
        name: 'dashboard',
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && to.path.startsWith('/auth')) {
    const redirectTo = to.query.redirectTo
    if (typeof redirectTo === 'string' && redirectTo !== to.path) {
      return { path: redirectTo }
    }
    return {
      name: 'dashboard',
    }
  }

  // Allow navigation
  return true
})

// Data Preloading Guard
router.beforeResolve(async (to: RouteLocationNormalized) => {
  const queryClient = useQueryClient()

  // Prefetch discussions list
  if (to.name === 'discussions') {
    const page = Number(to.query.page) || 1
    await queryClient.prefetchQuery(getDiscussionsQueryOptions({ page }))
  }

  // Prefetch single discussion
  if (to.name === 'discussion' && to.params.discussionId) {
    const discussionId = to.params.discussionId as string
    await queryClient.prefetchQuery(getDiscussionQueryOptions(discussionId))
  }
})

export default router
