import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { describe, test, expect, vi, beforeEach } from 'vitest'

import DiscussionsPage from '../discussions.vue'

import { render, screen, waitFor } from '@/testing/test-utils'
import type { User, Discussion } from '@/types/api'

const AUTH_USER_KEY = ['auth-user']

// Mock @unhead/vue
vi.mock('@unhead/vue', async () => {
  const actual = await vi.importActual('@unhead/vue')
  return {
    ...(actual as object),
    useHead: vi.fn(),
  }
})

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {},
    query: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
}))

// Mock user (ADMIN to see create discussion button)
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'ADMIN',
  bio: '',
  teamId: 'team-1',
  createdAt: Date.now(),
}

// Mock discussions
const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'First Discussion',
    body: 'First discussion body',
    author: mockUser,
    teamId: 'team-1',
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Second Discussion',
    body: 'Second discussion body',
    author: mockUser,
    teamId: 'team-1',
    createdAt: Date.now() - 1000,
  },
]

// Mock discussions API
vi.mock('@/features/discussions/api/get-discussions', () => ({
  useDiscussions: () => ({
    data: {
      value: {
        data: mockDiscussions,
        meta: {
          page: 1,
          totalPages: 1,
          total: mockDiscussions.length,
        },
      },
    },
    isLoading: { value: false },
    isError: { value: false },
    error: { value: null },
  }),
}))

// Mock create discussion API
const mockCreateMutate = vi.fn()
vi.mock('@/features/discussions/api/create-discussion', () => ({
  createDiscussionInputSchema: {},
  useCreateDiscussion: () => ({
    mutate: mockCreateMutate,
    isPending: { value: false },
    isSuccess: { value: false },
  }),
}))

// Mock delete discussion API
const mockDeleteMutate = vi.fn()
vi.mock('@/features/discussions/api/delete-discussion', () => ({
  useDeleteDiscussion: () => ({
    mutate: mockDeleteMutate,
    isPending: { value: false },
    isSuccess: { value: false },
  }),
}))

// Mock comments API for prefetch
vi.mock('@/features/comments/api/get-comments', () => ({
  getInfiniteCommentsQueryOptions: vi.fn(() => ({
    queryKey: ['comments'],
    queryFn: vi.fn(),
  })),
}))

describe('Discussions Page', () => {
  let pinia: ReturnType<typeof createPinia>
  let queryClient: QueryClient

  beforeEach(() => {
    pinia = createPinia()

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Set user in query cache (vue-query-auth pattern)
    queryClient.setQueryData(AUTH_USER_KEY, mockUser)

    vi.clearAllMocks()
  })

  test('should render discussions list', async () => {
    render(DiscussionsPage, {
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient }]],
      },
    })

    await waitFor(() => {
      expect(screen.getByText('First Discussion')).toBeInTheDocument()
      expect(screen.getByText('Second Discussion')).toBeInTheDocument()
    })
  })

  test('should render create discussion button', () => {
    render(DiscussionsPage, {
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient }]],
      },
    })

    expect(screen.getByRole('button', { name: /create discussion/i })).toBeInTheDocument()
  })

  test('should display page title', () => {
    render(DiscussionsPage, {
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient }]],
      },
    })

    expect(screen.getByText('Discussions')).toBeInTheDocument()
  })
})
