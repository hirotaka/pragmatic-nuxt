<script setup lang="ts">
import { reactive } from "vue";
import { useMutation } from "@pinia/colada";
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
import { loginMutation } from "~auth/app/queries/auth";
import { loginInputSchema, type LoginInput } from "~auth/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const emit = defineEmits<{
  success: [];
}>();

const { isLoading, mutateAsync } = useMutation(loginMutation());
const { addNotification } = useNotifications();

const state = reactive<LoginInput>({
  email: "",
  password: "",
});
const { r$ } = useRegleSchema(state, loginInputSchema);

const handleSubmit = async (event: FormSubmitEvent<LoginInput | undefined>) => {
  if (!event.data || isLoading.value) return;

  try {
    await mutateAsync(event.data);
    addNotification({
      type: "success",
      title: "Logged In",
    });
    emit("success");
  }
  catch {
    return;
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
          :is-loading="isLoading"
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
