<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from "vue";

interface CommentsProps {
  discussionId: string;
}

const props = defineProps<CommentsProps>();
const refreshTrigger = ref(0);

const handleCommentCreated = () => {
  refreshTrigger.value++;
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
      :discussion-id="props.discussionId"
      :refresh-trigger="refreshTrigger"
    />
  </div>
</template>
