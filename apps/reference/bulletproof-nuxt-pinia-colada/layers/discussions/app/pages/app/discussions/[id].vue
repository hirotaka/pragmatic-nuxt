<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@pinia/colada";
import AppSpinner from "~~/app/components/app/AppSpinner.vue";
import { Button } from "~~/app/components/ui/button";
import { discussionDetailQuery } from "~discussions/app/queries/discussions";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

const route = useRoute();

const discussionId = computed(() => route.params.id as string);
const { data, status, refresh } = useQuery(() => discussionDetailQuery({
  id: discussionId.value,
}));
const discussion = computed(() => data.value?.id === discussionId.value ? data.value : undefined);

useHead({
  title: computed(() => discussion.value?.title || "Discussion"),
});
</script>

<template>
  <LayoutsContentLayout
    :title="discussion?.title || 'Discussion'"
    description="Read, update, and discuss this team topic."
  >
    <AppSpinner
      v-if="status === 'pending' && !discussion"
      label="Loading discussion"
      class="flex justify-center p-8"
    />

    <div
      v-else-if="status === 'error' && !discussion"
      class="flex flex-col items-center justify-center gap-3 p-8 text-center"
      role="alert"
    >
      <p>Discussion could not be loaded.</p>
      <Button
        variant="outline"
        @click="refresh()"
      >
        Retry
      </Button>
    </div>

    <template v-else-if="discussion">
      <DiscussionView :discussion-id="discussion.id" />
      <div class="mt-6">
        <Comments :discussion-id="discussion.id" />
      </div>
    </template>
  </LayoutsContentLayout>
</template>
