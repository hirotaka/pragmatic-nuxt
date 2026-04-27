<script setup lang="ts">
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

const handleSubmit = (values: Record<string, unknown>) => {
  login.mutate(values as LoginInput);
};
</script>

<template>
  <div>
    <UForm
      :schema="loginInputSchema"
      @submit="handleSubmit"
    >
      <template #default>
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
        <div>
          <UButton
            :is-loading="login.isLoading.value"
            type="submit"
            class="w-full"
          >
            Log in
          </UButton>
        </div>
      </template>
    </UForm>
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
