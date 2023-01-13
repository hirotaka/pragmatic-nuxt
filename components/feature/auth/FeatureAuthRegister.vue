<script setup lang="ts">
import { ref, computed } from "vue";

import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";

const chooseTeam = ref(false);

const schema = z.object({
  email: z.string().min(1, "Required"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

const validationSchema = computed(() => {
  return toFormValidator(
    chooseTeam.value
      ? schema.and(z.object({ teamId: z.string().min(1, "Required") }))
      : schema.and(z.object({ teamName: z.string().min(1, "Required") }))
  );
});

const { register, isRegistering } = useAuth();
const { data: teams } = useTeams({
  config: {
    enabled: chooseTeam,
  },
});

type RegisterFormEmits = {
  (e: "success"): void;
};

const emits = defineEmits<RegisterFormEmits>();

async function onSubmit(values) {
  await register(values);
  emits("success");
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
          class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span
            :class="chooseTeam ? 'translate-x-6' : 'translate-x-1'"
            class="translate-x-6 inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
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
      <BaseButton type="submit" :is-loading="isRegistering" class="w-full">
        Register
      </BaseButton>
    </div>
  </FormWrapper>
</template>
