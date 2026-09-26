<script setup lang="ts">
import { toast } from "vue-sonner";

interface CreateCommentFormProps {
  disabled?: boolean;
  discussionId: string;
}

const props = defineProps<CreateCommentFormProps>();
const emit = defineEmits<{
  success: [];
}>();
const createComment = useCreateComment();
const isSubmitting = ref(false);
const isDisabled = computed(() => props.disabled || isSubmitting.value);

const state = reactive<CreateCommentFormState>({
  body: "",
  discussionId: props.discussionId,
});
const { r$ } = useFormSchema(state, createCommentInputSchema);
const bodyField = r$.$fields.body;

const handleSubmit = async () => {
  if (props.disabled || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const result = await r$.$validate();
    if (!result.valid) return;

    await createComment(result.data as CreateCommentInput);
  }
  catch {
    return;
  }
  finally {
    isSubmitting.value = false;
  }

  toast.success("Comment Created");
  emit("success");
};
</script>

<template>
  <form
    id="create-comment"
    novalidate
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <Field :data-invalid="bodyField.$error ? 'true' : undefined">
      <FieldLabel for="body">
        Body
      </FieldLabel>
      <Textarea
        id="body"
        v-model="bodyField.$value"
        name="body"
        :disabled="isDisabled"
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
  </form>
</template>
