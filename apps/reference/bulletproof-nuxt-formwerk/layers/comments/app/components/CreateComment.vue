<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { useCreateComment } from "~comments/app/composables/useCreateComment";
import {
  createCommentInputSchema,
  type CreateCommentInput,
} from "~comments/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface CreateCommentProps {
  discussionId: string;
}

const props = defineProps<CreateCommentProps>();
const emit = defineEmits<{
  created: [];
}>();

const { addNotification } = useNotifications();

const createComment = useCreateComment({
  onSuccess: async () => {
    addNotification({
      type: "success",
      title: "Comment Created",
    });
    await refreshNuxtData();
    emit("created");
  },
});

const handleSubmit = (values: Record<string, unknown>) => {
  createComment.mutate({
    body: values.body as string,
    discussionId: props.discussionId,
  } as CreateCommentInput);
};
</script>

<template>
  <UFormDrawer
    :is-done="createComment.isSuccess.value"
    title="Create Comment"
  >
    <template #triggerButton>
      <UButton size="sm">
        <template #icon>
          <Plus class="size-4" />
        </template>
        Create Comment
      </UButton>
    </template>

    <UForm
      id="create-comment"
      :schema="createCommentInputSchema"
      :initial-values="{
        body: '',
        discussionId: props.discussionId,
      }"
      @submit="handleSubmit"
    >
      <template #default="{ formState }">
        <UTextarea
          name="body"
          label="Body"
          :disabled="formState.isSubmitting"
        />
      </template>
    </UForm>

    <template #submitButton>
      <UButton
        type="submit"
        form="create-comment"
        size="sm"
        :is-loading="createComment.isPending.value"
      >
        Submit
      </UButton>
    </template>
  </UFormDrawer>
</template>
