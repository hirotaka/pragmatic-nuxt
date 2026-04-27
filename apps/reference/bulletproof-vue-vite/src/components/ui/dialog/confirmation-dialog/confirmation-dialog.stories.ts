import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'

import { Button } from '../../button'

import { ConfirmationDialog } from './'

const meta: Meta<typeof ConfirmationDialog> = {
  component: ConfirmationDialog,
}

export default meta

type Story = StoryObj<typeof ConfirmationDialog>

export const Danger: Story = {
  args: {
    icon: 'danger',
    title: 'Confirmation',
    body: 'Hello World',
    confirmButton: h(Button, { class: 'bg-red-500' }, () => 'Confirm'),
    triggerButton: h(Button, {}, () => 'Open'),
  },
}

export const Info: Story = {
  args: {
    icon: 'info',
    title: 'Confirmation',
    body: 'Hello World',
    confirmButton: h(Button, {}, () => 'Confirm'),
    triggerButton: h(Button, {}, () => 'Open'),
  },
}
