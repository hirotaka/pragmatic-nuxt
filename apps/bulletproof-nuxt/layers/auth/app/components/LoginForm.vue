<script setup lang="ts">
import { reactive } from "vue";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { useFormSchema } from "~~/app/composables/useFormSchema";
import { FormField } from "~~/app/components/form-field";
import { Input } from "~~/app/components/ui/input";
import { Button } from "~~/app/components/ui/button";
import { useLogin } from "~auth/app/composables/useLogin";
import {
  loginInputSchema,
  type LoginFormState,
  type LoginInput,
} from "~auth/shared/schemas";

const emit = defineEmits<{
  success: [];
}>();

const login = useLogin();

const state = reactive<LoginFormState>({
  email: "",
  password: "",
});
const { r$ } = useFormSchema(state, loginInputSchema);

const handleSubmit = async (event: FormSubmitEvent<LoginInput>) => {
  const values = event.data;

  try {
    await login(values);
    emit("success");
  }
  catch {
    // The request or session owner reports the failure.
  }
};
</script>

<template>
  <Form
    v-slot="{ loading }"
    :schema="r$"
    :state="r$.$value"
    class="space-y-6"
    @submit="handleSubmit"
  >
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
    <Button
      :is-loading="loading"
      type="submit"
      class="w-full"
    >
      Log in
    </Button>
  </Form>
</template>
