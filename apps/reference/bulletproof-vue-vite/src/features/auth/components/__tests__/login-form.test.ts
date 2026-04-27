import { expect, test, vi } from 'vitest'

import LoginForm from '../login-form.vue'

import { createUser, renderApp, screen, userEvent, waitFor } from '@/testing/test-utils'

test('should login new user and call onSuccess cb which should navigate the user to the app', async () => {
  const newUser = await createUser({ teamId: undefined })

  const onSuccess = vi.fn()

  await renderApp(LoginForm, { user: null, props: { onSuccess } })

  await userEvent.type(screen.getByLabelText(/email address/i), newUser.email)
  await userEvent.type(screen.getByLabelText(/password/i), newUser.password)

  await userEvent.click(screen.getByRole('button', { name: /log in/i }))

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
})
