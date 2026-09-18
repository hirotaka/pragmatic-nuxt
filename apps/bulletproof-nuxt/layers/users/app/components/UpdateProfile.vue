<script setup lang="ts">
import { reactive, watch } from "vue";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import { Input } from "~~/app/components/ui/input";
import { Textarea } from "~~/app/components/ui/textarea";
import { useUpdateProfile } from "~users/app/composables/useUpdateProfile";
import { updateProfileInputSchema, type UpdateProfileInput } from "~users/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const props = defineProps<{
  profile: UpdateProfileInput;
}>();
const emit = defineEmits<{
  success: [];
}>();
const { addNotification } = useNotifications();
const updateProfile = useUpdateProfile();

const state = reactive<UpdateProfileInput>({
  ...props.profile,
  bio: props.profile.bio ?? "",
});
const { r$ } = useRegleSchema(state, updateProfileInputSchema);

watch(
  () => props.profile,
  (profile) => {
    r$.$value.email = profile.email;
    r$.$value.firstName = profile.firstName;
    r$.$value.lastName = profile.lastName;
    r$.$value.bio = profile.bio ?? "";
  },
  { deep: true },
);

const handleSubmit = async (event: FormSubmitEvent<UpdateProfileInput | undefined>) => {
  const values = event.data ?? r$.$value;

  try {
    await updateProfile(values);
  }
  catch {
    // The request or session owner reports the failure.
    return;
  }

  addNotification({
    type: "success",
    title: "Profile Updated",
  });
  emit("success");
};
</script>

<template>
  <Form
    id="update-profile"
    :schema="r$"
    :state="r$.$value"
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
</template>
