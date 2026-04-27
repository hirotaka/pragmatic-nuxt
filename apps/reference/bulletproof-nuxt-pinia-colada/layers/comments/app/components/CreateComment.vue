<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { useCreateComment } from "~comments/app/composables/useCreateComment";
import { createCommentInputSchema } from "~comments/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface CreateCommentProps {
  discussionId: string;
}

const props = defineProps<CreateCommentProps>();

const { addNotification } = useNotifications();

const createComment = useCreateComment({
  onSuccess: () => {
    addNotification({
      type: "success",
      title: "Comment Created",
    });
  },
});

const handleSubmit = (values: Record<string, unknown>) => {
  createComment.mutate({
    body: String(values.body),
    discussionId: props.discussionId,
  });
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
      <template #default>
        <UTextarea
          name="body"
          label="Body"
          :disabled="createComment.isLoading.value"
        />
      </template>
    </UForm>

    <template #submitButton>
      <UButton
        type="submit"
        form="create-comment"
        size="sm"
        :is-loading="createComment.isLoading.value"
      >
        Submit
      </UButton>
    </template>
  </UFormDrawer>
</template>
