import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { describe, test, expect, vi, beforeEach } from 'vitest'

import DiscussionPage from '../discussion.vue'

import { render, screen, waitFor } from '@/testing/test-utils'
import type { User, Discussion, Comment } from '@/types/api'

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
const mockDiscussionId = 'discussion-1'
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { discussionId: mockDiscussionId },
    query: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
}))

// Mock user
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'USER',
  bio: '',
  teamId: 'team-1',
  createdAt: Date.now(),
}

// Mock discussion
const mockDiscussion: Discussion = {
  id: mockDiscussionId,
  title: 'Test Discussion',
  body: 'This is a test discussion body',
  author: mockUser,
  teamId: 'team-1',
  createdAt: Date.now(),
}

// Mock comments
const mockComments: Comment[] = [
  {
    id: 'comment-1',
    body: 'First comment',
    author: mockUser,
    discussionId: mockDiscussionId,
    createdAt: Date.now(),
  },
  {
    id: 'comment-2',
    body: 'Second comment',
    author: mockUser,
    discussionId: mockDiscussionId,
    createdAt: Date.now() - 1000,
  },
]

// Mock discussion API
vi.mock('@/features/discussions/api/get-discussion', () => ({
  useDiscussion: () => ({
    data: {
      value: {
        data: mockDiscussion,
      },
    },
    isLoading: { value: false },
    isError: { value: false },
    error: { value: null },
  }),
}))

// Mock update discussion API
const mockUpdateMutate = vi.fn()
vi.mock('@/features/discussions/api/update-discussion', () => ({
  updateDiscussionInputSchema: {},
  useUpdateDiscussion: () => ({
    mutate: mockUpdateMutate,
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

// Mock comments API
vi.mock('@/features/comments/api/get-comments', () => ({
  useInfiniteComments: () => ({
    data: {
      value: {
        pages: [
          {
            data: mockComments,
            meta: {
              page: 1,
              totalPages: 1,
              total: mockComments.length,
            },
          },
        ],
      },
    },
    isLoading: { value: false },
    isFetchingNextPage: { value: false },
    hasNextPage: { value: false },
    fetchNextPage: vi.fn(),
  }),
}))

// Mock create comment API
const mockCreateCommentMutate = vi.fn()
vi.mock('@/features/comments/api/create-comment', () => ({
  createCommentInputSchema: {},
  useCreateComment: () => ({
    mutate: mockCreateCommentMutate,
    isPending: { value: false },
    isSuccess: { value: false },
  }),
}))

// Mock delete comment API
const mockDeleteCommentMutate = vi.fn()
vi.mock('@/features/comments/api/delete-comment', () => ({
  useDeleteComment: () => ({
    mutate: mockDeleteCommentMutate,
    isPending: { value: false },
    isSuccess: { value: false },
  }),
}))

describe('Discussion Page', () => {
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

  test('should render discussion detail', async () => {
    render(DiscussionPage, {
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient }]],
        stubs: {
          MdPreview: {
            template: '<div>{{ value }}</div>',
            props: ['value'],
          },
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Test Discussion')).toBeInTheDocument()
      expect(screen.getByText('This is a test discussion body')).toBeInTheDocument()
    })
  })

  test('should render discussion title in header', async () => {
    render(DiscussionPage, {
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient }]],
        stubs: {
          MdPreview: {
            template: '<div>{{ value }}</div>',
            props: ['value'],
          },
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Test Discussion')).toBeInTheDocument()
    })
  })

  test('should render comments section', async () => {
    render(DiscussionPage, {
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient }]],
        stubs: {
          MdPreview: {
            template: '<div>{{ value }}</div>',
            props: ['value'],
          },
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText('First comment')).toBeInTheDocument()
      expect(screen.getByText('Second comment')).toBeInTheDocument()
    })
  })
})
