<script setup lang="ts">
import { useCreateDiscussion } from "~discussions/app/composables/useCreateDiscussion";
import { useRouter } from "vue-router";
import {
  createDiscussionInputSchema,
  type CreateDiscussionInput,
} from "~discussions/shared/schemas";
import { useFieldError } from "vee-validate";
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

const titleError = useFieldError("title");
const bodyError = useFieldError("body");

const handleSubmit = (values: Record<string, unknown>) => {
  createDiscussion.mutate(values as CreateDiscussionInput);
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

      <UFieldWrapper
        label="Title"
        html-for="title"
        :error="titleError"
      >
        <UInput
          name="title"
          type="text"
          placeholder="Enter discussion title (3-200 characters)"
        />
      </UFieldWrapper>

      <UFieldWrapper
        label="Body"
        html-for="body"
        :error="bodyError"
      >
        <UTextarea
          name="body"
          placeholder="Enter discussion body (minimum 10 characters)"
          :rows="8"
        />
      </UFieldWrapper>

      <div class="flex gap-2">
        <UButton
          :is-loading="createDiscussion.isLoading.value"
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
