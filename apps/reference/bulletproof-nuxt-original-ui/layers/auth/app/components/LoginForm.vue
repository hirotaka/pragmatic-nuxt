<script setup lang="ts">
import { reactive } from "vue";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "@/components/form";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "~auth/app/composables/useLogin";
import { loginInputSchema, type LoginInput } from "~auth/shared/schemas";

const emit = defineEmits<{
  success: [];
}>();

const login = useLogin({
  onSuccess: () => {
    emit("success");
  },
});

const state = reactive<LoginInput>({
  email: "",
  password: "",
});
const { r$ } = useRegleSchema(state, loginInputSchema);

const handleSubmit = async (event: FormSubmitEvent<LoginInput | undefined>) => {
  try {
    if (!event.data) return;
    await login.mutate(event.data);
  }
  catch {
    // Error is already handled in the composable via notification
  }
};
</script>

<template>
  <div>
    <Form
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
      <div>
        <Button
          :is-loading="login.isPending.value"
          type="submit"
          class="w-full"
        >
          Log in
        </Button>
      </div>
    </Form>
    <div class="mt-2 flex items-center justify-end">
      <div class="text-sm">
        <NuxtLink
          to="/auth/register"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Register
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
