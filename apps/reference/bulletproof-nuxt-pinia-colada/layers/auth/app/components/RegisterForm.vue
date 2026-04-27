<script setup lang="ts">
import { computed, ref } from "vue";
import { useRegister } from "~auth/app/composables/useRegister";
import { useRoute } from "vue-router";
import { registerInputSchema, type RegisterInput } from "~auth/shared/schemas";
import type { Team } from "~auth/shared/types";

interface RegisterFormProps {
  teams?: Team[];
}

const props = defineProps<RegisterFormProps>();

const emit = defineEmits<{
  success: [];
}>();

const chooseTeam = ref(false);

const route = useRoute();
const redirectTo = route.query.redirectTo as string | undefined;

const registering = useRegister({
  onSuccess: () => emit("success"),
});

const handleSubmit = (values: Record<string, unknown>) => {
  const input = {
    ...values,
    teamId: chooseTeam.value && values.teamId ? values.teamId : null,
    teamName: !chooseTeam.value && values.teamName ? values.teamName : null,
  } as RegisterInput;

  registering.mutate(input);
};

const teamOptions = computed(
  () =>
    props.teams?.map(team => ({
      label: team.name,
      value: team.id,
    })) ?? [],
);
</script>

<template>
  <div>
    <div class="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <p class="font-medium">
        Demo Site Notice
      </p>
      <p class="mt-1">
        This is a demo site. All data will be periodically cleared.
      </p>
    </div>
    <UForm
      :schema="registerInputSchema"
      :keep-values-on-unmount="false"
      @submit="handleSubmit"
    >
      <template #default>
        <UInput
          name="firstName"
          type="text"
          label="First Name"
        />
        <UInput
          name="lastName"
          type="text"
          label="Last Name"
        />
        <UInput
          name="email"
          type="email"
          label="Email Address"
        />
        <UInput
          name="password"
          type="password"
          label="Password"
        />

        <div class="flex items-center space-x-2">
          <USwitch
            id="choose-team"
            v-model:checked="chooseTeam"
          />
          <ULabel for="choose-team">
            Join Existing Team
          </ULabel>
        </div>

        <USelect
          v-if="chooseTeam"
          name="teamId"
          label="Team"
          :options="teamOptions"
        />
        <UInput
          v-else
          name="teamName"
          type="text"
          label="Team Name"
        />

        <div>
          <UButton
            :is-loading="registering.isLoading.value"
            type="submit"
            class="w-full"
          >
            Register
          </UButton>
        </div>
      </template>
    </UForm>
    <div class="mt-2 flex items-center justify-end">
      <div class="text-sm">
        <NuxtLink
          :to="`/auth/login${redirectTo ? `?redirectTo=${redirectTo}` : ''}`"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Log In
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
