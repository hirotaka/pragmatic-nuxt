import { expect, test } from 'vitest'
import { defineComponent, h } from 'vue'

import { Authorization, ROLES } from '../authorization'

import { createUser, renderApp, screen, waitFor } from '@/testing/test-utils'

const AUTH_USER_KEY = ['auth-user']

test('should view protected resource if user role is matching', async () => {
  const user = await createUser({
    role: ROLES.ADMIN,
  })

  const protectedResource = 'This is very confidential data'

  const TestComponent = defineComponent({
    setup() {
      return () =>
        h(
          Authorization,
          { allowedRoles: [ROLES.ADMIN] },
          {
            default: () => h('div', protectedResource),
          },
        )
    },
  })

  const { queryClient } = await renderApp(TestComponent, { user })

  // Set the user in the query cache
  queryClient.setQueryData(AUTH_USER_KEY, user)

  // Wait for Vue to re-render after setting the user
  await waitFor(() => {
    expect(screen.getByText(protectedResource)).toBeInTheDocument()
  })
})

test('should not view protected resource if user role does not match and show fallback message instead', async () => {
  const user = await createUser({
    role: ROLES.USER,
  })

  const protectedResource = 'This is very confidential data'
  const forbiddenMessage = 'You are unauthorized to view this resource'

  const TestComponent = defineComponent({
    setup() {
      return () =>
        h(
          Authorization,
          { allowedRoles: [ROLES.ADMIN] },
          {
            default: () => h('div', protectedResource),
            forbiddenFallback: () => h('div', forbiddenMessage),
          },
        )
    },
  })

  const { queryClient } = await renderApp(TestComponent, { user })

  // Set the user in the query cache
  queryClient.setQueryData(AUTH_USER_KEY, user)

  expect(screen.queryByText(protectedResource)).not.toBeInTheDocument()
  expect(screen.getByText(forbiddenMessage)).toBeInTheDocument()
})

test('should view protected resource if policy check passes', async () => {
  const user = await createUser({
    role: ROLES.ADMIN,
  })

  const comment = {
    id: '1',
    body: 'Test comment',
    discussionId: '1',
    createdAt: Date.now(),
    author: user,
  }

  const protectedResource = 'This is very confidential data'

  const TestComponent = defineComponent({
    setup() {
      return () =>
        h(
          Authorization,
          {
            policyCheck: 'comment:delete',
            data: comment,
          },
          {
            default: () => h('div', protectedResource),
          },
        )
    },
  })

  const { queryClient } = await renderApp(TestComponent, { user })

  // Set the user in the query cache
  queryClient.setQueryData(AUTH_USER_KEY, user)

  // Wait for Vue to re-render after setting the user
  await waitFor(() => {
    expect(screen.getByText(protectedResource)).toBeInTheDocument()
  })
})

test('should not view protected resource if policy check fails and show fallback message instead', async () => {
  const user = await createUser({
    role: ROLES.USER,
  })

  const otherUser = await createUser({
    role: ROLES.USER,
  })

  const comment = {
    id: '1',
    body: 'Test comment',
    discussionId: '1',
    createdAt: Date.now(),
    author: otherUser,
  }

  const protectedResource = 'This is very confidential data'
  const forbiddenMessage = 'You are unauthorized to view this resource'

  const TestComponent = defineComponent({
    setup() {
      return () =>
        h(
          Authorization,
          {
            policyCheck: 'comment:delete',
            data: comment,
          },
          {
            default: () => h('div', protectedResource),
            forbiddenFallback: () => h('div', forbiddenMessage),
          },
        )
    },
  })

  const { queryClient } = await renderApp(TestComponent, { user })

  // Set the user in the query cache
  queryClient.setQueryData(AUTH_USER_KEY, user)

  expect(screen.queryByText(protectedResource)).not.toBeInTheDocument()
  expect(screen.getByText(forbiddenMessage)).toBeInTheDocument()
})
