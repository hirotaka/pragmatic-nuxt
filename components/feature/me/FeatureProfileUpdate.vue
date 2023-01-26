<script setup lang="ts">
import { toFormValidator } from '@vee-validate/zod'
import { z } from 'zod'
import { PencilIcon } from '@heroicons/vue/24/solid'
import { UpdateProfileDTO } from '~~/composables/api/me/updateProfile'

const validationSchema = toFormValidator(
  z.object({
    email: z.string().min(1, 'Required'),
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    bio: z.string().min(1, 'Required')
  })
)

const { data: profile } = useProfile()
const { isLoading, isSuccess, mutateAsync } = useUpdateProfile()

async function onSubmit(values: UpdateProfileDTO['data']) {
  await mutateAsync({ data: values })
}
</script>

<template>
  <FormDrawer title="Update Profile" :is-done="isSuccess">
    <template #triggerButton>
      <BaseButton size="sm">
        <template #startIcon>
          <PencilIcon class="h-4 w-4" />
        </template>
        Update Profile
      </BaseButton>
    </template>
    <template #submitButton>
      <BaseButton
        type="submit"
        form="update-profile"
        size="sm"
        :is-loading="isLoading"
      >
        Submit
      </BaseButton>
    </template>
    <FormWrapper
      id="update-profile"
      :validation-schema="validationSchema"
      @submit="onSubmit"
    >
      <FormInputField
        name="firstName"
        label="First Name"
        :value="profile?.firstName"
        type="text"
      />
      <FormInputField
        name="lastName"
        label="Last Name"
        :value="profile?.lastName"
        type="text"
      />
      <FormInputField
        name="email"
        label="Email Address"
        :value="profile?.email"
        type="email"
      />
      <FormTextareaField name="bio" label="Bio" :value="profile?.bio" />
    </FormWrapper>
  </FormDrawer>
</template>
