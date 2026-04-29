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
  onSuccess: async () => {
    addNotification({
      type: "success",
      title: "Discussion Created",
    });
    await refreshNuxtData();
  },
});

const handleSubmit = async (values: Record<string, unknown>) => {
  await createDiscussion.mutate(values as CreateDiscussionInput);
};
</script>

<template>
  <UFormDrawer
    :is-done="createDiscussion.isSuccess.value"
    title="Create Discussion"
  >
    <template #trigger-button>
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
      <template #default="{ formState }">
        <UInput
          name="title"
          type="text"
          label="Title"
          :disabled="formState.isSubmitting"
        />
        <UTextarea
          name="body"
          label="Body"
          :rows="5"
          :disabled="formState.isSubmitting"
        />
      </template>
    </UForm>

    <template #submit-button>
      <UButton
        type="submit"
        form="create-discussion"
        size="sm"
        :is-loading="createDiscussion.isPending.value"
      >
        Submit
      </UButton>
    </template>
  </UFormDrawer>
</template>
