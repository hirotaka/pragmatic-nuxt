import type { Meta, StoryObj } from '@storybook/vue3'

import Spinner from './spinner.vue'

const meta: Meta<typeof Spinner> = {
  component: Spinner,
}

export default meta

type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  args: {
    size: 'md',
  },
}
