<script setup lang="ts">
import { TrashIcon } from "@heroicons/vue/24/outline";

type DeleteDiscussionProps = {
  id: string;
};

const props = defineProps<DeleteDiscussionProps>();

const { isLoading, isSuccess, mutateAsync } = useDeleteDiscussion();

async function onClick() {
  await mutateAsync({ discussionId: props.id });
}
</script>

<template>
  <AppAuthorizationProvider :allowed-roles="[ROLES.ADMIN]">
    <BaseConfirmationDialog
      :is-done="isSuccess"
      icon="danger"
      title="Delete Discussion"
      body="Are you sure you want to delete this discussion?"
    >
      <template #triggerButton>
        <BaseButton variant="danger">
          <template #startIcon>
            <TrashIcon class="h-4 w-4" />
          </template>
          Delete Discussion
        </BaseButton>
      </template>
      <template #confirmButton>
        <BaseButton
          type="button"
          class="bg-red-600"
          :is-loading="isLoading"
          @click="onClick"
        >
          Delete Discussion
        </BaseButton>
      </template>
    </BaseConfirmationDialog>
  </AppAuthorizationProvider>
</template>
