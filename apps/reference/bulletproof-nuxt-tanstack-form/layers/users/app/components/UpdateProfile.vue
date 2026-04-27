<script setup lang="ts">
import { computed } from "vue";
import { Pen } from "lucide-vue-next";
import { useUpdateProfile } from "~users/app/composables/useUpdateProfile";
import { updateProfileInputSchema } from "~users/shared/schemas";
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

const handleSubmit = async (values: Record<string, unknown>) => {
  await updateProfile.mutate({
    email: String(values.email ?? ""),
    firstName: String(values.firstName ?? ""),
    lastName: String(values.lastName ?? ""),
    bio: String(values.bio ?? ""),
  });
};

const initialValues = computed(() => ({
  email: user.value?.email || "",
  firstName: user.value?.firstName || "",
  lastName: user.value?.lastName || "",
  bio: user.value?.bio || "",
}));
</script>

<template>
  <UFormDrawer
    :is-done="updateProfile.isSuccess.value"
    title="Update Profile"
  >
    <template #triggerButton>
      <UButton size="sm">
        <template #icon>
          <Pen class="size-4" />
        </template>
        Update Profile
      </UButton>
    </template>

    <UForm
      id="update-profile"
      :schema="updateProfileInputSchema"
      :initial-values="initialValues"
      @submit="handleSubmit"
    >
      <template #default="{ formState }">
        <UInput
          name="firstName"
          type="text"
          label="First Name"
          :disabled="formState.isSubmitting"
        />
        <UInput
          name="lastName"
          type="text"
          label="Last Name"
          :disabled="formState.isSubmitting"
        />
        <UInput
          name="email"
          type="email"
          label="Email"
          :disabled="formState.isSubmitting"
        />
        <UTextarea
          name="bio"
          label="Bio"
          :rows="4"
          :disabled="formState.isSubmitting"
        />
      </template>
    </UForm>

    <template #submitButton>
      <UButton
        type="submit"
        form="update-profile"
        size="sm"
        :is-loading="updateProfile.isPending.value"
      >
        Submit
      </UButton>
    </template>
  </UFormDrawer>
</template>
