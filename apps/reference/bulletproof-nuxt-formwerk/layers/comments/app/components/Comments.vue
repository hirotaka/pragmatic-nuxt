<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from "vue";

interface CommentsProps {
  discussionId: string;
}

const props = defineProps<CommentsProps>();
const commentsListRef = ref<{ loadComments: (page?: number) => Promise<void> } | null>(null);

const handleCommentCreated = () => {
  // Reload comments list when a new comment is created
  commentsListRef.value?.loadComments(1);
};
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-xl font-bold">
        Comments:
      </h3>
      <CreateComment
        :discussion-id="props.discussionId"
        @created="handleCommentCreated"
      />
    </div>
    <CommentsList
      ref="commentsListRef"
      :discussion-id="props.discussionId"
    />
  </div>
</template>
