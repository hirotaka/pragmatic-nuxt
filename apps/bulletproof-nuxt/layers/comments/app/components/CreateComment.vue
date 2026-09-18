<script setup lang="ts">
import { reactive } from "vue";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import { Textarea } from "~~/app/components/ui/textarea";
import { useCreateComment } from "~comments/app/composables/useCreateComment";
import { createCommentInputSchema, type CreateCommentInput } from "~comments/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface CreateCommentProps {
  disabled?: boolean;
  discussionId: string;
  refresh: () => Promise<void>;
}

const props = defineProps<CreateCommentProps>();
const emit = defineEmits<{
  success: [];
}>();
const { addNotification } = useNotifications();
const createComment = useCreateComment();

const state = reactive<CreateCommentInput>({
  body: "",
  discussionId: props.discussionId,
});
const { r$ } = useRegleSchema(state, createCommentInputSchema);

const handleSubmit = async (event: FormSubmitEvent<CreateCommentInput | undefined>) => {
  if (props.disabled) return;

  const values = event.data ?? r$.$value;

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
  await props.refresh().catch(() => undefined);
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
