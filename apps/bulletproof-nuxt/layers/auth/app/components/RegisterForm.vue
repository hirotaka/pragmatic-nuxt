<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { RegleSchemaStatus } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { useFormSchema } from "~~/app/composables/useFormSchema";
import { FormField } from "~~/app/components/form-field";
import { Input } from "~~/app/components/ui/input";
import { NativeSelect } from "~~/app/components/ui/select";
import { Button } from "~~/app/components/ui/button";
import { useRegister } from "~auth/app/composables/useRegister";
import {
  registerInputSchema,
  type RegisterFormState,
  type RegisterInput,
} from "~auth/shared/schemas";
import type { Team } from "~auth/shared/types";

type RegisterRegle = RegleSchemaStatus<
  RegisterFormState,
  typeof registerInputSchema,
  Record<string, never>,
  true
>;

interface RegisterFormProps {
  teams?: Team[];
}

const props = defineProps<RegisterFormProps>();

const emit = defineEmits<{
  success: [];
}>();

const chooseTeam = ref(false);
const register = useRegister();

const state = reactive<RegisterFormState>({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  teamId: null,
  teamName: "",
});
const { r$: registerRegle } = useFormSchema(
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

const handleSubmit = async (event: FormSubmitEvent<RegisterInput>) => {
  const values = event.data;

  try {
    await register(values);
    emit("success");
  }
  catch {
    // The request or session owner reports the failure.
  }
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
  <Form
    v-slot="{ loading }"
    :schema="r$"
    :state="r$.$value"
    class="space-y-3"
    @submit="handleSubmit"
  >
    <div class="grid gap-3 sm:grid-cols-2">
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
    </div>
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

    <div class="rounded-lg border bg-muted/40 p-2">
      <div class="flex items-start space-x-3">
        <input
          id="choose-team"
          v-model="chooseTeam"
          type="checkbox"
          aria-label="Join existing team"
          class="mt-1 size-4 rounded border-input"
        >
        <div class="grid gap-1.5 leading-none">
          <label
            for="choose-team"
            class="text-sm font-medium leading-none"
          >
            Join an existing team
          </label>
          <p class="text-sm text-muted-foreground">
            Leave this off to create a new team for your workspace.
          </p>
        </div>
      </div>
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

    <Button
      :is-loading="loading"
      type="submit"
      class="w-full"
    >
      Register
    </Button>
  </Form>
</template>
