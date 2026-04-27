import type { Meta, StoryObj } from '@storybook/vue3'

import Notification from './notification.vue'

const meta = {
  title: 'Components/Notifications',
  component: Notification,
  argTypes: {
    notification: {
      description: 'Notification object containing id, type, title, and optional message',
    },
    onDismiss: {
      action: 'dismiss',
    },
  },
} satisfies Meta<typeof Notification>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    notification: {
      id: '1',
      type: 'info',
      title: 'Information',
      message: 'This is an informational notification',
    },
  },
}

export const Success: Story = {
  args: {
    notification: {
      id: '2',
      type: 'success',
      title: 'Success',
      message: 'Your operation completed successfully',
    },
  },
}

export const Warning: Story = {
  args: {
    notification: {
      id: '3',
      type: 'warning',
      title: 'Warning',
      message: 'Please be careful with this action',
    },
  },
}

export const Error: Story = {
  args: {
    notification: {
      id: '4',
      type: 'error',
      title: 'Error',
      message: 'Something went wrong, please try again',
    },
  },
}

export const WithoutMessage: Story = {
  args: {
    notification: {
      id: '5',
      type: 'info',
      title: 'Quick notification',
    },
  },
}
