<script setup lang="ts">
import CommentsList from './comments-list.vue'
import CreateComment from './create-comment.vue'

interface CommentsProps {
  discussionId: string
}

const props = defineProps<CommentsProps>()
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-xl font-bold">Comments:</h3>
      <CreateComment :discussion-id="props.discussionId" />
    </div>
    <CommentsList :discussion-id="props.discussionId" />
  </div>
</template>
