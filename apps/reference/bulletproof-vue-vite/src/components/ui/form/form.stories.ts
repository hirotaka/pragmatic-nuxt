import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'
import { z } from 'zod'

import { Button } from '../button'

import { Form, FormDrawer, Input, Select, Textarea } from './'

const MyForm = (hideSubmit = false) => ({
  components: { Form, Input, Textarea, Select, Button },
  setup() {
    const handleSubmit = async (values: Record<string, unknown>) => {
      alert(JSON.stringify(values, null, 2))
    }

    const schema = z.object({
      title: z.string().min(1, 'Required'),
      description: z.string().min(1, 'Required'),
      type: z.string().min(1, 'Required'),
    })

    return { handleSubmit, schema, hideSubmit }
  },
  template: `
    <Form
      :schema="schema"
      @submit="handleSubmit"
      id="my-form"
    >
      <Input
        name="title"
        label="Title"
      />
      <Textarea
        name="description"
        label="Description"
      />
      <Select
        name="type"
        label="Type"
        :options="[
          { label: 'A', value: 'A' },
          { label: 'B', value: 'B' },
          { label: 'C', value: 'C' }
        ]"
      />

      <div v-if="!hideSubmit">
        <Button type="submit" class="w-full">
          Submit
        </Button>
      </div>
    </Form>
  `,
})

const meta: Meta = {
  component: Form,
}

export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => MyForm(false),
}

export const AsFormDrawer: Story = {
  render: () => ({
    components: { FormDrawer, Form, Input, Textarea, Select, Button },
    setup() {
      const handleSubmit = async (values: Record<string, unknown>) => {
        alert(JSON.stringify(values, null, 2))
      }

      const schema = z.object({
        title: z.string().min(1, 'Required'),
        description: z.string().min(1, 'Required'),
        type: z.string().min(1, 'Required'),
      })

      return {
        handleSubmit,
        schema,
        triggerButton: h(Button, {}, () => 'Open Form'),
        submitButton: h(Button, { form: 'my-form', type: 'submit' }, () => 'Submit'),
      }
    },
    template: `
      <FormDrawer
        :trigger-button="triggerButton"
        :is-done="true"
        title="My Form"
        :submit-button="submitButton"
      >
        <Form
          :schema="schema"
          @submit="handleSubmit"
          id="my-form"
        >
          <Input
            name="title"
            label="Title"
          />
          <Textarea
            name="description"
            label="Description"
          />
          <Select
            name="type"
            label="Type"
            :options="[
              { label: 'A', value: 'A' },
              { label: 'B', value: 'B' },
              { label: 'C', value: 'C' }
            ]"
          />
        </Form>
      </FormDrawer>
    `,
  }),
}
