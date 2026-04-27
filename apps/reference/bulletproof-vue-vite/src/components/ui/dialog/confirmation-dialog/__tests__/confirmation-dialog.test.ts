import { test, expect } from 'vitest'
import { h } from 'vue'

import { ConfirmationDialog } from '../'

import { Button } from '@/components/ui/button'
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils'

test('should handle confirmation flow', async () => {
  const titleText = 'Are you sure?'
  const bodyText = 'Are you sure you want to delete this item?'
  const confirmationButtonText = 'Confirm'
  const openButtonText = 'Open'

  rtlRender(ConfirmationDialog, {
    props: {
      icon: 'danger',
      title: titleText,
      body: bodyText,
      confirmButton: h(Button, {}, () => confirmationButtonText),
      triggerButton: h(Button, {}, () => openButtonText),
    },
  })

  expect(screen.queryByText(titleText)).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: openButtonText }))

  expect(await screen.findByText(titleText)).toBeInTheDocument()

  expect(screen.getByText(bodyText)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

  await waitFor(() => expect(screen.queryByText(titleText)).not.toBeInTheDocument())

  expect(screen.queryByText(bodyText)).not.toBeInTheDocument()
})
