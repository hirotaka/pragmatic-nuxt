<script setup lang="ts">
import { useCreateDiscussion } from "~discussions/app/composables/useCreateDiscussion";
import { useRouter } from "vue-router";
import {
  createDiscussionInputSchema,
  type CreateDiscussionInput,
} from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const emit = defineEmits<{
  success: [discussionId: string];
}>();

const router = useRouter();
const { addNotification } = useNotifications();

const createDiscussion = useCreateDiscussion({
  onSuccess: (discussion) => {
    addNotification({
      type: "success",
      title: "Discussion Created",
    });
    emit("success", discussion.id);
    router.push(`/app/discussions/${discussion.id}`);
  },
});

const handleSubmit = async (values: Record<string, unknown>) => {
  try {
    await createDiscussion.mutate(values as CreateDiscussionInput);
  }
  catch {
    // Error is already handled in the composable
  }
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">
      Create New Discussion
    </h2>

    <UForm
      :schema="createDiscussionInputSchema"
      @submit="handleSubmit"
    >
      <div
        v-if="createDiscussion.error.value"
        class="mb-4 text-sm text-destructive"
        role="alert"
      >
        {{ createDiscussion.error.value.message }}
      </div>

      <UInput
        name="title"
        label="Title"
        type="text"
        placeholder="Enter discussion title (3-200 characters)"
      />

      <UTextarea
        name="body"
        label="Body"
        placeholder="Enter discussion body (minimum 10 characters)"
        :rows="8"
      />

      <div class="flex gap-2">
        <UButton
          :is-loading="createDiscussion.isPending.value"
          type="submit"
          class="flex-1"
        >
          Submit
        </UButton>
        <UButton
          variant="outline"
          type="button"
          @click="router.push('/app/discussions')"
        >
          Cancel
        </UButton>
      </div>
    </UForm>
  </div>
</template>
