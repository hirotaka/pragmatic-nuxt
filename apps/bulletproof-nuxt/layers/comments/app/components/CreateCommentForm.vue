<script setup lang="ts">
import { reactive } from "vue";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { useFormSchema } from "~~/app/composables/useFormSchema";
import { FormField } from "~~/app/components/form-field";
import { Textarea } from "~~/app/components/ui/textarea";
import { useCreateComment } from "~comments/app/composables/useCreateComment";
import {
  createCommentInputSchema,
  type CreateCommentFormState,
  type CreateCommentInput,
} from "~comments/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface CreateCommentFormProps {
  disabled?: boolean;
  discussionId: string;
}

const props = defineProps<CreateCommentFormProps>();
const emit = defineEmits<{
  success: [];
}>();
const { addNotification } = useNotifications();
const createComment = useCreateComment();

const state = reactive<CreateCommentFormState>({
  body: "",
  discussionId: props.discussionId,
});
const { r$ } = useFormSchema(state, createCommentInputSchema);

const handleSubmit = async (event: FormSubmitEvent<CreateCommentInput>) => {
  if (props.disabled) return;

  const values = event.data;

  try {
    await createComment(values);
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "Comment Created",
  });
  emit("success");
};
</script>

<template>
  <Form
    id="create-comment"
    :schema="r$"
    :state="r$.$value"
    :disabled="props.disabled"
    class="space-y-6"
    @submit="handleSubmit"
  >
    <FormField
      v-slot="field"
      name="body"
      label="Body"
    >
      <Textarea
        v-model="r$.$value.body"
        v-bind="field"
      />
    </FormField>
  </Form>
</template>
