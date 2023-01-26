<script setup lang="ts">
import { ref, computed } from 'vue'

import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { toFormValidator } from '@vee-validate/zod'
import { z } from 'zod'

import { RegisterCredentialsDTO } from '~/composables/api/auth/register'

const chooseTeam = ref(false)

const schema = z.object({
  email: z.string().min(1, 'Required'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required')
})

chooseTeam.value
  ? schema.extend({ teamId: z.string().min(1, 'Required') })
  : schema.extend({ teamName: z.string().min(1, 'Required') })

const validationSchema = computed(() => {
  return toFormValidator(schema)
})

const { isLoading, mutateAsync } = useAuthRegister()
const { data: teams } = useTeams()

type RegisterFormEmits = {
  (e: 'success'): void
}

const emits = defineEmits<RegisterFormEmits>()

const onSubmit = async (values: RegisterCredentialsDTO) => {
  try {
    await mutateAsync(values)
    emits('success')
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <FormWrapper :validation-schema="validationSchema" @submit="onSubmit">
    <FormInputField name="firstName" type="text" label="First Name" />
    <FormInputField name="lastName" type="text" label="Last Name" />
    <FormInputField name="email" type="email" label="Email Address" />
    <FormInputField name="password" type="password" label="Password" />
    <SwitchGroup>
      <div class="flex items-center">
        <Switch
          v-model="chooseTeam"
          :class="chooseTeam ? 'bg-blue-600' : 'bg-gray-200'"
          class="
            relative
            inline-flex
            items-center
            h-6
            rounded-full
            w-11
            transition-colors
            focus:outline-none
            focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          "
        >
          <span
            :class="chooseTeam ? 'translate-x-6' : 'translate-x-1'"
            class="
              translate-x-6
              inline-block
              w-4
              h-4
              transform
              bg-white
              rounded-full
              transition-transform
            "
          />
        </Switch>
        <SwitchLabel class="ml-4">Join Existing Team</SwitchLabel>
      </div>
    </SwitchGroup>
    <FormSelectField
      v-if="chooseTeam && teams"
      name="teamId"
      label="Team"
      :options="teams.map((team) => ({ label: team.name, value: team.id }))"
    />
    <FormInputField v-else name="teamName" type="text" label="Team Name" />
    <div>
      <BaseButton type="submit" :is-loading="isLoading" class="w-full">
        Register
      </BaseButton>
    </div>
  </FormWrapper>
</template>
