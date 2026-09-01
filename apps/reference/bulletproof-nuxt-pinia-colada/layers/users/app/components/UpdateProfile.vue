<script setup lang="ts">
import { reactive, watch } from "vue";
import { Pen } from "lucide-vue-next";
import { useMutation } from "@pinia/colada";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Input } from "~~/app/components/ui/input";
import { Textarea } from "~~/app/components/ui/textarea";
import { Button } from "~~/app/components/ui/button";
import { updateProfileMutation } from "~users/app/queries/profile";
import { updateProfileInputSchema, type UpdateProfileInput } from "~users/shared/schemas";
import { useUser } from "#layers/auth/app/composables/useUser";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const { user } = useUser();
const { addNotification } = useNotifications();

const { isLoading, mutateAsync, status } = useMutation(updateProfileMutation());
const isPending = computed(() => isLoading.value);
const isDone = computed(() => status.value === "success");

const state = reactive<UpdateProfileInput>({
  email: "",
  firstName: "",
  lastName: "",
  bio: "",
});

const { r$ } = useRegleSchema(state, updateProfileInputSchema);

watch(
  () => user.value,
  (nextUser) => {
    if (!nextUser) return;
    r$.$value.email = nextUser.email;
    r$.$value.firstName = nextUser.firstName;
    r$.$value.lastName = nextUser.lastName;
    r$.$value.bio = nextUser.bio ?? "";
  },
  { immediate: true },
);

const handleSubmit = async (event: FormSubmitEvent<UpdateProfileInput | undefined>) => {
  if (isLoading.value || !user.value) return;

  const values = event.data ?? r$.$value;

  try {
    await mutateAsync({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      bio: values.bio ?? "",
    });
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "Profile Updated",
  });
};
</script>

<template>
  <FormDrawer
    :is-done="isDone"
    :is-pending="isPending"
    title="Update Profile"
  >
    <template #triggerButton>
      <Button
        variant="outline"
        size="sm"
      >
        <template #icon>
          <Pen class="size-4" />
        </template>
        Update Profile
      </Button>
    </template>

    <Form
      id="update-profile"
      :schema="updateProfileInputSchema"
      :state="r$.$value"
      :disabled="isPending"
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
        label="Email"
      >
        <Input
          v-model="r$.$value.email"
          v-bind="field"
          type="email"
        />
      </FormField>
      <FormField
        v-slot="field"
        name="bio"
        label="Bio"
      >
        <Textarea
          v-model="r$.$value.bio"
          v-bind="field"
          :rows="4"
        />
      </FormField>
    </Form>
    <template #submitButton>
      <Button
        type="submit"
        form="update-profile"
        size="sm"
        :is-loading="isPending"
      >
        Submit
      </Button>
    </template>
  </FormDrawer>
</template>
