<script setup lang="ts">
import { reactive, watch } from "vue";
import { Pen } from "lucide-vue-next";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "@/components/form";
import { FormField } from "@/components/form-field";
import FormDrawer from "~~/components/app/FormDrawer.vue";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpdateProfile } from "~users/app/composables/useUpdateProfile";
import { updateProfileInputSchema, type UpdateProfileInput } from "~users/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

const { addNotification } = useNotifications();
const { user } = useUser();
const { fetch: fetchSession } = useUserSession();

const updateProfile = useUpdateProfile({
  onSuccess: async () => {
    // Refresh user session from server
    await fetchSession();

    addNotification({
      type: "success",
      title: "Profile Updated",
    });
  },
  onError: (error) => {
    addNotification({
      type: "error",
      title: "Failed to update profile",
      message: error.message,
    });
  },
});

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
    r$.$value.email = nextUser?.email ?? "";
    r$.$value.firstName = nextUser?.firstName ?? "";
    r$.$value.lastName = nextUser?.lastName ?? "";
    r$.$value.bio = nextUser?.bio ?? "";
  },
  { immediate: true },
);

const handleSubmit = async (event: FormSubmitEvent<UpdateProfileInput | undefined>) => {
  const values = event.data ?? r$.$value;

  try {
    await updateProfile.mutate({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      bio: values.bio ?? "",
    });
  }
  catch {
    // Error is surfaced through the mutation notification callbacks.
  }
};
</script>

<template>
  <FormDrawer
    :is-done="updateProfile.isSuccess.value"
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
      :disabled="updateProfile.isPending.value"
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
        :is-loading="updateProfile.isPending.value"
      >
        Submit
      </Button>
    </template>
  </FormDrawer>
</template>
