<script setup lang="ts">
import { toast } from "vue-sonner";

interface UpdateDiscussionFormProps {
  body: string;
  discussionId: string;
  title: string;
}

const props = defineProps<UpdateDiscussionFormProps>();
const emit = defineEmits<{
  success: [];
}>();
const updateDiscussion = useUpdateDiscussion(() => props.discussionId);
const isSubmitting = ref(false);

const state = reactive<UpdateDiscussionFormState>({
  title: props.title,
  body: props.body,
});
const { r$ } = useFormSchema(state, updateDiscussionInputSchema);
const titleField = r$.$fields.title!;
const bodyField = r$.$fields.body!;

watch(
  () => [props.title, props.body] as const,
  ([title, body]) => {
    r$.$value.title = title;
    r$.$value.body = body;
  },
);

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const result = await r$.$validate();
    if (!result.valid) return;

    await updateDiscussion(result.data as UpdateDiscussionInput);
  }
  catch {
    return;
  }
  finally {
    isSubmitting.value = false;
  }

  toast.success("Discussion Updated");
  emit("success");
};
</script>

<template>
  <form
    id="update-discussion"
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
