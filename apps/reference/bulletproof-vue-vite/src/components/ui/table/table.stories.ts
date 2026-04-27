import type { Meta, StoryObj } from '@storybook/vue3'

import { Table } from './'

type GenericMeta<C> = Omit<Meta<C>, 'component'> & {
  component: Record<keyof C, unknown>
}

type User = {
  id: string
  createdAt: number
  name: string
  title: string
  role: string
  email: string
}

const meta = {
  component: Table,
} satisfies GenericMeta<typeof Table<User>>

export default meta

type Story = StoryObj<typeof Table<User>>

const data: User[] = [
  {
    id: '1',
    createdAt: Date.now(),
    name: 'Jane Cooper',
    title: 'Regional Paradigm Technician',
    role: 'Admin',
    email: 'jane.cooper@example.com',
  },
  {
    id: '2',
    createdAt: Date.now(),
    name: 'Cody Fisher',
    title: 'Product Directives Officer',
    role: 'Owner',
    email: 'cody.fisher@example.com',
  },
]

export const Default: Story = {
  args: {
    data,
    columns: [
      {
        title: 'Name',
        field: 'name',
      },
      {
        title: 'Title',
        field: 'title',
      },
      {
        title: 'Role',
        field: 'role',
      },
      {
        title: 'Email',
        field: 'email',
      },
    ],
  },
}
