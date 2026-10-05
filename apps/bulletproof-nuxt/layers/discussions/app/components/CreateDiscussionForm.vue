<script setup lang="ts">
import { toast } from "vue-sonner";

const emit = defineEmits<{
  success: [];
}>();
const createDiscussion = useCreateDiscussion();
const isSubmitting = ref(false);

const state = reactive<CreateDiscussionFormState>({
  title: "",
  body: "",
});
const { r$ } = useFormSchema(state, createDiscussionInputSchema);
const titleField = r$.$fields.title;
const bodyField = r$.$fields.body;

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const result = await r$.$validate();
    if (!result.valid) return;

    await createDiscussion(result.data as CreateDiscussionInput);
  }
  catch {
    return;
  }
  finally {
    isSubmitting.value = false;
  }

  toast.success("Discussion Created");
  emit("success");
};
</script>

<template>
  <form
    id="create-discussion"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <FieldGroup class="gap-6">
      <Field
        :data-invalid="titleField.$error ? 'true' : undefined"
        :data-disabled="isSubmitting ? 'true' : undefined"
      >
        <FieldLabel for="title">
          Title
        </FieldLabel>
        <Input
          id="title"
          v-model="titleField.$value"
          name="title"
          type="text"
          :disabled="isSubmitting"
          :aria-invalid="titleField.$error ? 'true' : undefined"
          :aria-describedby="titleField.$error ? 'title-error' : undefined"
          @blur="titleField.$touch()"
          @change="titleField.$touch()"
        />
        <FieldError
          v-if="titleField.$error"
          id="title-error"
          :errors="titleField.$errors"
        />
      </Field>

      <Field
        :data-invalid="bodyField.$error ? 'true' : undefined"
        :data-disabled="isSubmitting ? 'true' : undefined"
      >
        <FieldLabel for="body">
          Body
        </FieldLabel>
        <Textarea
          id="body"
          v-model="bodyField.$value"
          name="body"
          :disabled="isSubmitting"
          :rows="5"
          :aria-invalid="bodyField.$error ? 'true' : undefined"
          :aria-describedby="bodyField.$error ? 'body-error' : undefined"
          @blur="bodyField.$touch()"
          @change="bodyField.$touch()"
        />
        <FieldError
          v-if="bodyField.$error"
          id="body-error"
          :errors="bodyField.$errors"
        />
      </Field>
    </FieldGroup>
  </form>
</template>
