<script setup lang="ts">
const emit = defineEmits<{
  success: [];
}>();

const login = useLogin();
const isSubmitting = ref(false);

const state = reactive<LoginFormState>({
  email: "",
  password: "",
});
const { r$ } = useFormSchema(state, loginInputSchema);
const emailField = r$.$fields.email;
const passwordField = r$.$fields.password;

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const result = await r$.$validate();
    if (!result.valid) return;

    await login(result.data as LoginInput);
    emit("success");
  }
  catch {
    // The request or session owner reports the failure.
  }
  finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <form
    novalidate
    class="flex flex-col gap-6"
    @submit.prevent="handleSubmit"
  >
    <FieldGroup class="gap-6">
      <Field
        :data-invalid="emailField.$error ? 'true' : undefined"
        :data-disabled="isSubmitting ? 'true' : undefined"
      >
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

      <Field
        :data-invalid="passwordField.$error ? 'true' : undefined"
        :data-disabled="isSubmitting ? 'true' : undefined"
      >
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
    </FieldGroup>

    <Button
      :disabled="isSubmitting"
      :aria-busy="isSubmitting"
      type="submit"
      class="w-full"
    >
      <Spinner
        v-if="isSubmitting"
        data-icon="inline-start"
        aria-hidden="true"
      />
      Log in
    </Button>
  </form>
</template>
