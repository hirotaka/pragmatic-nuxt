<script setup lang="ts">
import { toast } from "vue-sonner";

interface CommentCreateFormProps {
  disabled?: boolean;
  discussionId: string;
}

const props = defineProps<CommentCreateFormProps>();
const emit = defineEmits<{
  success: [];
}>();
const createComment = useCommentCreate();
const isSubmitting = ref(false);
const isDisabled = computed(() => props.disabled || isSubmitting.value);

const state = reactive<CreateCommentFormState>({
  body: "",
});
const { r$ } = useFormSchema(state, createCommentInputSchema);
const bodyField = r$.$fields.body;

const handleSubmit = async () => {
  if (props.disabled || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const result = await r$.$validate();
    if (!result.valid) return;

    await createComment(props.discussionId, result.data as CreateCommentInput);
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
    @submit.prevent="handleSubmit"
  >
    <FieldGroup>
      <Field
        :data-invalid="bodyField.$error ? 'true' : undefined"
        :data-disabled="isDisabled ? 'true' : undefined"
      >
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
    </FieldGroup>
  </form>
</template>
