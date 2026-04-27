<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
interface CommentsProps {
  discussionId: string;
}

const props = defineProps<CommentsProps>();
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-xl font-bold">
        Comments:
      </h3>
      <CreateComment :discussion-id="props.discussionId" />
    </div>
    <CommentsList :discussion-id="props.discussionId" />
  </div>
</template>
