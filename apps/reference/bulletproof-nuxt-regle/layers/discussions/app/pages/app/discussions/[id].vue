<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
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
  >
    <div
      v-if="discussion.isPending.value"
      class="flex h-48 w-full items-center justify-center"
    >
      <USpinner size="lg" />
    </div>
    <template v-else-if="discussion.data.value.discussion">
      <DiscussionView :discussion-id="discussionId" />
      <div class="mt-8">
        <Comments :discussion-id="discussionId" />
      </div>
    </template>
  </LayoutsContentLayout>
</template>
