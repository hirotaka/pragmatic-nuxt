import type { Meta, StoryObj } from '@storybook/vue3'

import { Button } from './'

const meta: Meta<typeof Button> = {
  component: Button,
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: `
      <Button v-bind="args">
        {{ args.default }}
      </Button>
    `,
  }),
}

export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    variant: 'default',
    default: 'Button',
  },
}
