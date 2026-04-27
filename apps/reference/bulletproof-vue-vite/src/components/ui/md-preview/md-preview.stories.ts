import type { Meta, StoryObj } from '@storybook/vue3'

import { MDPreview } from './'

const meta: Meta<typeof MDPreview> = {
  component: MDPreview,
}

export default meta

type Story = StoryObj<typeof MDPreview>

export const Default: Story = {
  args: {
    value: `## Hello World!`,
  },
}
