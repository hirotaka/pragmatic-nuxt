import type { Meta, StoryObj } from '@storybook/vue3'

import { Link } from './'

const meta: Meta<typeof Link> = {
  component: Link,
  render: (args) => ({
    components: { Link },
    setup() {
      return { args }
    },
    template: `
      <Link v-bind="args">
        {{ args.default }}
      </Link>
    `,
  }),
}

export default meta

type Story = StoryObj<typeof Link>

export const Default: Story = {
  args: {
    default: 'Link',
    to: '/',
  },
}
