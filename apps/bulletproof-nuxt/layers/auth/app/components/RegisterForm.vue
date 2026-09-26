<script setup lang="ts">
import type { RegleSchemaStatus } from "@regle/schemas";
import type { Team } from "#layers/teams/shared/types/team";

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
const isSubmitting = ref(false);
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
const firstNameField = r$.$fields.firstName;
const lastNameField = r$.$fields.lastName;
const emailField = r$.$fields.email;
const passwordField = r$.$fields.password;
const teamIdField = r$.$fields.teamId;
const teamNameField = r$.$fields.teamName;

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

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const result = await r$.$validate();
    if (!result.valid) return;

    await register(result.data as RegisterInput);
    emit("success");
  }
  catch {
    // The request or session owner reports the failure.
  }
  finally {
    isSubmitting.value = false;
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
  <form
    novalidate
    class="space-y-3"
    @submit.prevent="handleSubmit"
  >
    <div class="grid gap-3 sm:grid-cols-2">
      <Field :data-invalid="firstNameField.$error ? 'true' : undefined">
        <FieldLabel for="first-name">
          First Name
        </FieldLabel>
        <Input
          id="first-name"
          v-model="firstNameField.$value"
          name="firstName"
          :disabled="isSubmitting"
          :aria-invalid="firstNameField.$error ? 'true' : undefined"
          :aria-describedby="firstNameField.$error ? 'first-name-error' : undefined"
          @blur="firstNameField.$touch()"
          @change="firstNameField.$touch()"
        />
        <FieldError
          v-if="firstNameField.$error"
          id="first-name-error"
          :errors="firstNameField.$errors"
        />
      </Field>

      <Field :data-invalid="lastNameField.$error ? 'true' : undefined">
        <FieldLabel for="last-name">
          Last Name
        </FieldLabel>
        <Input
          id="last-name"
          v-model="lastNameField.$value"
          name="lastName"
          :disabled="isSubmitting"
          :aria-invalid="lastNameField.$error ? 'true' : undefined"
          :aria-describedby="lastNameField.$error ? 'last-name-error' : undefined"
          @blur="lastNameField.$touch()"
          @change="lastNameField.$touch()"
        />
        <FieldError
          v-if="lastNameField.$error"
          id="last-name-error"
          :errors="lastNameField.$errors"
        />
      </Field>
    </div>

    <Field :data-invalid="emailField.$error ? 'true' : undefined">
      <FieldLabel for="email">
        Email Address
      </FieldLabel>
      <Input
        id="email"
        v-model="emailField.$value"
        name="email"
        type="email"
        :disabled="isSubmitting"
        :aria-invalid="emailField.$error ? 'true' : undefined"
        :aria-describedby="emailField.$error ? 'email-error' : undefined"
        @blur="emailField.$touch()"
        @change="emailField.$touch()"
      />
      <FieldError
        v-if="emailField.$error"
        id="email-error"
        :errors="emailField.$errors"
      />
    </Field>

    <Field :data-invalid="passwordField.$error ? 'true' : undefined">
      <FieldLabel for="password">
        Password
      </FieldLabel>
      <Input
        id="password"
        v-model="passwordField.$value"
        name="password"
        type="password"
        :disabled="isSubmitting"
        :aria-invalid="passwordField.$error ? 'true' : undefined"
        :aria-describedby="passwordField.$error ? 'password-error' : undefined"
        @blur="passwordField.$touch()"
        @change="passwordField.$touch()"
      />
      <FieldError
        v-if="passwordField.$error"
        id="password-error"
        :errors="passwordField.$errors"
      />
    </Field>

    <div class="rounded-lg border bg-muted/40 p-2">
      <div class="flex items-start space-x-3">
        <input
          id="choose-team"
          v-model="chooseTeam"
          type="checkbox"
          aria-label="Join existing team"
          class="mt-1 size-4 rounded border-input"
          :disabled="isSubmitting"
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

    <Field
      v-if="chooseTeam"
      :data-invalid="teamIdField.$error ? 'true' : undefined"
    >
      <FieldLabel for="team-id">
        Team
      </FieldLabel>
      <NativeSelect
        id="team-id"
        v-model="teamIdField.$value"
        name="teamId"
        :disabled="isSubmitting"
        :options="teamOptions"
        placeholder="Select team"
        :aria-invalid="teamIdField.$error ? 'true' : undefined"
        :aria-describedby="teamIdField.$error ? 'team-id-error' : undefined"
        @blur="teamIdField.$touch()"
        @change="teamIdField.$touch()"
      />
      <FieldError
        v-if="teamIdField.$error"
        id="team-id-error"
        :errors="teamIdField.$errors"
      />
    </Field>

    <Field
      v-else
      :data-invalid="teamNameField.$error ? 'true' : undefined"
    >
      <FieldLabel for="team-name">
        Team Name
      </FieldLabel>
      <Input
        id="team-name"
        v-model="teamNameField.$value"
        name="teamName"
        :disabled="isSubmitting"
        :aria-invalid="teamNameField.$error ? 'true' : undefined"
        :aria-describedby="teamNameField.$error ? 'team-name-error' : undefined"
        @blur="teamNameField.$touch()"
        @change="teamNameField.$touch()"
      />
      <FieldError
        v-if="teamNameField.$error"
        id="team-name-error"
        :errors="teamNameField.$errors"
      />
    </Field>

    <Button
      :is-loading="isSubmitting"
      type="submit"
      class="w-full"
    >
      Register
    </Button>
  </form>
</template>
