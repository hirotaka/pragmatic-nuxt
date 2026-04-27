<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Form, Input, Select, Label } from '@/components/ui/form'
import { paths } from '@/config/paths'
import { useRegister, registerInputSchema, type RegisterInput } from '@/lib/auth'
import type { Team } from '@/types/api'

interface RegisterFormProps {
  onSuccess: () => void
  chooseTeam: boolean
  setChooseTeam: () => void
  teams?: Team[]
}

const props = defineProps<RegisterFormProps>()

const route = useRoute()
const redirectTo = route.query.redirectTo as string | undefined

const registering = useRegister({
  onSuccess: props.onSuccess,
})

const handleSubmit = (values: Record<string, unknown>) => {
  registering.mutate(values as RegisterInput)
}

const teamOptions = computed(
  () =>
    props.teams?.map((team) => ({
      label: team.name,
      value: team.id,
    })) ?? [],
)
</script>

<template>
  <div>
    <Form :schema="registerInputSchema" :keep-values-on-unmount="false" @submit="handleSubmit">
      <template #default>
        <Input name="firstName" type="text" label="First Name" />
        <Input name="lastName" type="text" label="Last Name" />
        <Input name="email" type="email" label="Email Address" />
        <Input name="password" type="password" label="Password" />

        <div class="flex items-center space-x-2">
          <SwitchRoot
            :model-value="chooseTeam"
            @update:model-value="setChooseTeam"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
            id="choose-team"
          >
            <SwitchThumb
              class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            />
          </SwitchRoot>
          <Label htmlFor="choose-team">Join Existing Team</Label>
        </div>

        <Select v-if="chooseTeam && teams" name="teamId" label="Team" :options="teamOptions" />
        <Input v-else name="teamName" type="text" label="Team Name" />

        <div>
          <Button :is-loading="registering.isPending.value" type="submit" class="w-full">
            Register
          </Button>
        </div>
      </template>
    </Form>
    <div class="mt-2 flex items-center justify-end">
      <div class="text-sm">
        <RouterLink
          :to="paths.auth.login.getHref(redirectTo ?? '')"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Log In
        </RouterLink>
      </div>
    </div>
  </div>
</template>
