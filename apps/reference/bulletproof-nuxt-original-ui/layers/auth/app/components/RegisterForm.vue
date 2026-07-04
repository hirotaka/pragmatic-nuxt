<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "@/components/form";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { useRegister } from "~auth/app/composables/useRegister";
import { useRoute } from "vue-router";
import { registerInputSchema, type RegisterInput } from "~auth/shared/schemas";
import type { Team } from "~auth/shared/types";

type RegisterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  teamId: string | null;
  teamName: string | null;
};

type RegisterRegle = {
  $value: RegisterFormState;
} & Record<string, unknown>;

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

const state = reactive<RegisterFormState>({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  teamId: null,
  teamName: "",
});
const { r$: registerRegle } = useRegleSchema(
  state as never,
  registerInputSchema as never,
);
const r$ = registerRegle as unknown as RegisterRegle;

watch(chooseTeam, (nextChooseTeam) => {
  if (nextChooseTeam) {
    r$.$value.teamName = null;
    r$.$value.teamId = "";
  }
  else {
    r$.$value.teamId = null;
    r$.$value.teamName = "";
  }
});

const handleSubmit = async (event: FormSubmitEvent<RegisterFormState | undefined>): Promise<void> => {
  const values = event.data ?? state;
  const input = {
    ...values,
    teamId: chooseTeam.value && values.teamId ? values.teamId : null,
    teamName: !chooseTeam.value && values.teamName ? values.teamName : null,
  } as RegisterInput;

  await registering.mutate(input);
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
    <Form
      :schema="r$"
      :state="r$.$value"
      class="space-y-6"
      @submit="handleSubmit"
    >
      <FormField
        v-slot="field"
        name="firstName"
        label="First Name"
      >
        <Input
          v-model="r$.$value.firstName"
          v-bind="field"
        />
      </FormField>
      <FormField
        v-slot="field"
        name="lastName"
        label="Last Name"
      >
        <Input
          v-model="r$.$value.lastName"
          v-bind="field"
        />
      </FormField>
      <FormField
        v-slot="field"
        name="email"
        label="Email Address"
      >
        <Input
          v-model="r$.$value.email"
          v-bind="field"
          type="email"
        />
      </FormField>
      <FormField
        v-slot="field"
        name="password"
        label="Password"
      >
        <Input
          v-model="r$.$value.password"
          v-bind="field"
          type="password"
        />
      </FormField>

      <div class="flex items-center space-x-2">
        <input
          id="choose-team"
          v-model="chooseTeam"
          type="checkbox"
          class="size-4"
        >
        <Label for="choose-team">
          Join Existing Team
        </Label>
      </div>

      <FormField
        v-if="chooseTeam"
        v-slot="field"
        name="teamId"
        label="Team"
      >
        <NativeSelect
          v-model="r$.$value.teamId"
          v-bind="field"
          :options="teamOptions"
          placeholder="Select team"
        />
      </FormField>
      <FormField
        v-else
        v-slot="field"
        name="teamName"
        label="Team Name"
      >
        <Input
          v-model="r$.$value.teamName"
          v-bind="field"
        />
      </FormField>

      <div>
        <Button
          :is-loading="registering.isPending.value"
          type="submit"
          class="w-full"
        >
          Register
        </Button>
      </div>
    </Form>
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
