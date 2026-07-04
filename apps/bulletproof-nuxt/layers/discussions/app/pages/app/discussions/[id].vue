<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { Spinner } from "@/components/ui/spinner";
import { useDiscussion } from "~discussions/app/composables/useDiscussion";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

const route = useRoute();

const discussionId = computed(() => route.params.id as string);
const discussion = useDiscussion(discussionId);

useHead({
  title: computed(() => discussion.data.value.discussion?.title || "Discussion"),
});

onMounted(async () => {
  await discussion.fetch();
});
</script>

<template>
  <LayoutsContentLayout
    :title="discussion.data.value.discussion?.title || 'Discussion'"
    description="Read, update, and discuss this team topic."
  >
    <div
      v-if="discussion.isPending.value"
      class="flex h-48 w-full items-center justify-center rounded-xl border bg-card"
    >
      <Spinner size="lg" />
    </div>
    <template v-else-if="discussion.data.value.discussion">
      <DiscussionView :discussion-id="discussionId" />
      <div class="mt-6">
        <Comments :discussion-id="discussionId" />
      </div>
    </template>
  </LayoutsContentLayout>
</template>
