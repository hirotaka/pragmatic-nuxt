import { test, expect, vi } from 'vitest'
import { defineComponent } from 'vue'
import { z } from 'zod'

import { Form, Input } from '../'

import { Button } from '@/components/ui/button'
import { rtlRender, screen, waitFor, userEvent } from '@/testing/test-utils'

const testData = {
  title: 'Hello World',
}

const schema = z.object({
  title: z.string().min(1, 'Required'),
})

test('should render and submit a basic Form component', async () => {
  const handleSubmit = vi.fn()

  const TestForm = defineComponent({
    name: 'TestForm',
    components: {
      UIForm: Form,
      UIInput: Input,
      UIButton: Button,
    },
    setup() {
      return {
        schema,
        handleSubmit,
      }
    },
    template: `
      <UIForm :schema="schema" @submit="handleSubmit" id="my-form">
        <UIInput
          label="Title"
          name="title"
        />
        <UIButton name="submit" type="submit" class="w-full">
          Submit
        </UIButton>
      </UIForm>
    `,
  })

  rtlRender(TestForm)

  await userEvent.type(screen.getByLabelText(/title/i), testData.title)

  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith(testData))
})

test('should fail submission if validation fails', async () => {
  const handleSubmit = vi.fn()

  const TestForm = defineComponent({
    name: 'TestForm',
    components: {
      UIForm: Form,
      UIInput: Input,
      UIButton: Button,
    },
    setup() {
      return {
        schema,
        handleSubmit,
      }
    },
    template: `
      <UIForm :schema="schema" @submit="handleSubmit" id="my-form">
        <UIInput
          label="Title"
          name="title"
        />
        <UIButton name="submit" type="submit" class="w-full">
          Submit
        </UIButton>
      </UIForm>
    `,
  })

  rtlRender(TestForm)

  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  await screen.findByRole('alert', { name: /required/i })

  expect(handleSubmit).toHaveBeenCalledTimes(0)
})
