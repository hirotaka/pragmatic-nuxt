<script setup lang="ts">
import { computed } from "vue";
import { useDiscussion } from "~discussions/app/composables/useDiscussion";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

const route = useRoute();

const discussionId = computed(() => route.params.id as string);
const { data: discussion } = await useDiscussion(discussionId);

useHead({
  title: computed(() => discussion.value?.title || "Discussion"),
});
</script>

<template>
  <LayoutsContentLayout
    :title="discussion?.title || 'Discussion'"
    description="Read, update, and discuss this team topic."
  >
    <template v-if="discussion">
      <DiscussionView :discussion-id="discussion.id" />
      <div class="mt-6">
        <Comments :discussion-id="discussion.id" />
      </div>
    </template>
  </LayoutsContentLayout>
</template>
