<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { Pen } from "lucide-vue-next";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Input } from "~~/app/components/ui/input";
import { Textarea } from "~~/app/components/ui/textarea";
import { Button } from "~~/app/components/ui/button";
import { useUpdateProfile } from "~users/app/composables/useUpdateProfile";
import { updateProfileInputSchema, type UpdateProfileInput } from "~users/shared/schemas";
import { useUser } from "#layers/auth/app/composables/useUser";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const { user } = useUser();
const { addNotification } = useNotifications();

const updateProfile = useUpdateProfile();
const isPending = ref(false);
const isSuccess = ref(false);

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
  if (isPending.value) return;

  const values = event.data ?? r$.$value;
  isPending.value = true;
  isSuccess.value = false;

  try {
    await updateProfile({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      bio: values.bio ?? "",
    });
    addNotification({
      type: "success",
      title: "Profile Updated",
    });
    isSuccess.value = true;
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
  <FormDrawer
    :is-done="isSuccess"
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
