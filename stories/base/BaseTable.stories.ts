import type { Meta, StoryFn } from '@storybook/vue3'
import BaseTable from '~/components/base/BaseTable.vue'

export default {
  title: 'Components/Base/BaseTable',
  component: BaseTable,
  parameters: {
    controls: { expanded: true }
  },
  argTypes: {}
} as Meta<typeof BaseTable>

type User = {
  id: string
  name: string
  title: string
  role: string
  email: string
}

const data: User[] = [
  {
    id: '1',
    name: 'Jane Cooper',
    title: 'Regional Paradigm Technician',
    role: 'Admin',
    email: 'jane.cooper@example.com'
  },
  {
    id: '2',
    name: 'Cody Fisher',
    title: 'Product Directives Officer',
    role: 'Owner',
    email: 'cody.fisher@example.com'
  }
]

const Template: StoryFn<typeof BaseTable> = (args) => ({
  components: { BaseTable },
  setup() {
    return { args }
  },
  template: '<BaseTable v-bind="args" />'
})

export const Default = Template.bind({})
Default.args = {
  data: data as any,
  columns: [
    {
      title: 'Name',
      field: 'name'
    },
    {
      title: 'Title',
      field: 'title'
    },
    {
      title: 'Role',
      field: 'role'
    },
    {
      title: 'Email',
      field: 'email'
    }
  ]
}
