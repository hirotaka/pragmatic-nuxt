<script setup lang="ts">
import { toFormValidator } from '@vee-validate/zod'
import { z } from 'zod'

import { PlusIcon } from '@heroicons/vue/24/outline'
import { CreateDiscussionDTO } from '~/composables/api/discussions/createDiscussion'

const validationSchema = toFormValidator(
  z.object({
    title: z.string().min(1, 'Required'),
    body: z.string().min(1, 'Required')
  })
)

const { isLoading, isSuccess, mutateAsync } = useCreateDiscussion()

const onSubmit = async (values: CreateDiscussionDTO['data']) => {
  await mutateAsync({ data: values })
}
</script>

<template>
  <AppAuthorizationProvider :allowed-roles="[ROLES.ADMIN]">
    <FormDrawer title="Create Discussion" :is-done="isSuccess">
      <template #triggerButton>
        <BaseButton size="sm">
          <template #startIcon>
            <PlusIcon class="h-4 w-4" />
          </template>
          Create Discussion
        </BaseButton>
      </template>
      <template #submitButton>
        <BaseButton
          type="submit"
          form="create-discussion"
          size="sm"
          :is-loading="isLoading"
        >
          Submit
        </BaseButton>
      </template>
      <FormWrapper
        id="create-discussion"
        :validation-schema="validationSchema"
        @submit="onSubmit"
      >
        <FormInputField name="title" label="Title" type="text" />
        <FormTextareaField name="body" label="Body" />
      </FormWrapper>
    </FormDrawer>
  </AppAuthorizationProvider>
</template>
