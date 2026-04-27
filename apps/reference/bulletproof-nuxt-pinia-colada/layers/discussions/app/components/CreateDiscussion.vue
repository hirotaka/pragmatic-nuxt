<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { useCreateDiscussion } from "~discussions/app/composables/useCreateDiscussion";
import {
  createDiscussionInputSchema,
  type CreateDiscussionInput,
} from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const { addNotification } = useNotifications();

const createDiscussion = useCreateDiscussion({
  onSuccess: () => {
    addNotification({
      type: "success",
      title: "Discussion Created",
    });
  },
});

const handleSubmit = (values: Record<string, unknown>) => {
  createDiscussion.mutate(values as CreateDiscussionInput);
};
</script>

<template>
  <UFormDrawer
    :is-done="createDiscussion.isSuccess.value"
    title="Create Discussion"
  >
    <template #triggerButton>
      <UButton size="sm">
        <template #icon>
          <Plus class="size-4" />
        </template>
        Create Discussion
      </UButton>
    </template>

    <UForm
      id="create-discussion"
      :schema="createDiscussionInputSchema"
      @submit="handleSubmit"
    >
      <template #default>
        <UInput
          name="title"
          type="text"
          label="Title"
          :disabled="createDiscussion.isLoading.value"
        />
        <UTextarea
          name="body"
          label="Body"
          :rows="5"
          :disabled="createDiscussion.isLoading.value"
        />
      </template>
    </UForm>

    <template #submitButton>
      <UButton
        type="submit"
        form="create-discussion"
        size="sm"
        :is-loading="createDiscussion.isLoading.value"
      >
        Submit
      </UButton>
    </template>
  </UFormDrawer>
</template>
