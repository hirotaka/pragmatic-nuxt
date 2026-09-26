<script setup lang="ts">
import { toast } from "vue-sonner";

const props = defineProps<{
  profile: UpdateProfileInput;
}>();
const emit = defineEmits<{
  success: [];
}>();
const updateProfile = useUpdateProfile();
const isSubmitting = ref(false);

const state = reactive<UpdateProfileFormState>({
  ...props.profile,
  bio: props.profile.bio ?? "",
});
const { r$ } = useFormSchema(state, updateProfileInputSchema);
const firstNameField = r$.$fields.firstName;
const lastNameField = r$.$fields.lastName;
const emailField = r$.$fields.email;
const bioField = r$.$fields.bio!;

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

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const result = await r$.$validate();
    if (!result.valid) return;

    await updateProfile(result.data as UpdateProfileInput);
  }
  catch {
    // The request or session owner reports the failure.
    return;
  }
  finally {
    isSubmitting.value = false;
  }

  toast.success("Profile Updated");
  emit("success");
};
</script>

<template>
  <form
    id="update-profile"
    novalidate
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <Field :data-invalid="firstNameField.$error ? 'true' : undefined">
      <FieldLabel for="first-name">
        First Name
      </FieldLabel>
      <Input
        id="first-name"
        v-model="firstNameField.$value"
        name="firstName"
        :disabled="isSubmitting"
        :aria-invalid="firstNameField.$error ? 'true' : undefined"
        :aria-describedby="firstNameField.$error ? 'first-name-error' : undefined"
        @blur="firstNameField.$touch()"
        @change="firstNameField.$touch()"
      />
      <FieldError
        v-if="firstNameField.$error"
        id="first-name-error"
        :errors="firstNameField.$errors"
      />
    </Field>

    <Field :data-invalid="lastNameField.$error ? 'true' : undefined">
      <FieldLabel for="last-name">
        Last Name
      </FieldLabel>
      <Input
        id="last-name"
        v-model="lastNameField.$value"
        name="lastName"
        :disabled="isSubmitting"
        :aria-invalid="lastNameField.$error ? 'true' : undefined"
        :aria-describedby="lastNameField.$error ? 'last-name-error' : undefined"
        @blur="lastNameField.$touch()"
        @change="lastNameField.$touch()"
      />
      <FieldError
        v-if="lastNameField.$error"
        id="last-name-error"
        :errors="lastNameField.$errors"
      />
    </Field>

    <Field :data-invalid="emailField.$error ? 'true' : undefined">
      <FieldLabel for="email">
        Email
      </FieldLabel>
      <Input
        id="email"
        v-model="emailField.$value"
        name="email"
        type="email"
        :disabled="isSubmitting"
        :aria-invalid="emailField.$error ? 'true' : undefined"
        :aria-describedby="emailField.$error ? 'email-error' : undefined"
        @blur="emailField.$touch()"
        @change="emailField.$touch()"
      />
      <FieldError
        v-if="emailField.$error"
        id="email-error"
        :errors="emailField.$errors"
      />
    </Field>

    <Field :data-invalid="bioField.$error ? 'true' : undefined">
      <FieldLabel for="bio">
        Bio
      </FieldLabel>
      <Textarea
        id="bio"
        v-model="bioField.$value"
        name="bio"
        :rows="4"
        :disabled="isSubmitting"
        :aria-invalid="bioField.$error ? 'true' : undefined"
        :aria-describedby="bioField.$error ? 'bio-error' : undefined"
        @blur="bioField.$touch()"
        @change="bioField.$touch()"
      />
      <FieldError
        v-if="bioField.$error"
        id="bio-error"
        :errors="bioField.$errors"
      />
    </Field>
  </form>
</template>
