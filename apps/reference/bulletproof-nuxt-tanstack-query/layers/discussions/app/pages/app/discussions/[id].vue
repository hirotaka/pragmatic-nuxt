<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed, onServerPrefetch } from "vue";
import { Button } from "~~/app/components/ui/button";
import { Spinner } from "~~/app/components/ui/spinner";
import { discussionDetailQuery } from "~discussions/app/queries/discussions";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

const route = useRoute();
const { isQueryEnabled } = useServerStateQueryState();
const discussionId = computed(() => route.params.id as string);
const query = computed(() => discussionDetailQuery({
  id: discussionId.value,
  enabled: isQueryEnabled.value,
}));
const discussionQuery = useQuery(query);

if (import.meta.server) {
  onServerPrefetch(() => discussionQuery.suspense());
}

const {
  data: discussion,
  refetch,
  status,
} = discussionQuery;

const refresh = async (): Promise<void> => {
  await refetch({ throwOnError: true });
};

useHead({
  title: computed(() => discussion.value?.title || "Discussion"),
});
</script>

<template>
  <LayoutsContentLayout
    :title="discussion?.title || 'Discussion'"
    description="Read, update, and discuss this team topic."
  >
    <div
      v-if="status === 'pending' && !discussion"
      class="flex justify-center p-8"
      role="status"
    >
      <Spinner size="lg" />
      <span class="sr-only">Loading discussion</span>
    </div>

    <div
      v-else-if="status === 'error' && !discussion"
      class="flex flex-col items-center justify-center gap-3 p-8 text-center"
      role="alert"
    >
      <p>Discussion could not be loaded.</p>
      <Button
        variant="outline"
        @click="refresh"
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
