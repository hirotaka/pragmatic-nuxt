<script setup lang="ts">
const route = useRoute();

const discussionId = computed(() => route.params.id as string);
const { data: discussion } = await useDiscussion(discussionId);

useHead({
  title: computed(() => discussion.value?.title || "Discussion"),
});
</script>

<template>
  <PageContent
    :title="discussion?.title || 'Discussion'"
    description="Read, update, and discuss this team topic."
  >
    <template v-if="discussion">
      <DiscussionView :discussion-id="discussion.id" />
      <div class="mt-6">
        <CommentSection
          :key="discussion.id"
          :discussion-id="discussion.id"
        />
      </div>
    </template>
  </PageContent>
</template>
