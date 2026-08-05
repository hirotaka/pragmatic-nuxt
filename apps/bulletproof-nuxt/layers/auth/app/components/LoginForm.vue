<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~~/app/components/ui/card";
import { Input } from "~~/app/components/ui/input";
import { Button } from "~~/app/components/ui/button";
import { useLogin } from "~auth/app/composables/useLogin";
import { loginInputSchema, type LoginInput } from "~auth/shared/schemas";

const emit = defineEmits<{
  success: [];
}>();

const login = useLogin();
const isPending = ref(false);

const state = reactive<LoginInput>({
  email: "",
  password: "",
});
const { r$ } = useRegleSchema(state, loginInputSchema);

const handleSubmit = async (event: FormSubmitEvent<LoginInput | undefined>) => {
  if (!event.data || isPending.value) return;
  isPending.value = true;

  try {
    await login(event.data);
    emit("success");
  }
  catch {
    // `$api` reports the request failure.
  }
  finally {
    isPending.value = false;
  }
};
</script>

<template>
  <Card>
    <CardHeader class="text-center">
      <CardTitle class="text-xl">
        Welcome back
      </CardTitle>
      <CardDescription>
        Log in to continue managing your team's discussions.
      </CardDescription>
    </CardHeader>
    <CardContent>
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
        <Button
          :is-loading="isPending"
          type="submit"
          class="w-full"
        >
          Log in
        </Button>
      </Form>
      <div class="mt-4 text-center text-sm">
        Don&apos;t have an account?
        <NuxtLink
          to="/auth/register"
          class="font-medium underline underline-offset-4"
        >
          Register
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
