<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from "vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  <Card>
    <CardHeader>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Comments</CardTitle>
          <CardDescription>Continue the discussion with your team.</CardDescription>
        </div>
        <CreateComment
          :discussion-id="props.discussionId"
          @created="handleCommentCreated"
        />
      </div>
    </CardHeader>
    <CardContent>
      <CommentsList
        :discussion-id="discussionId"
        :refresh-trigger="refreshTrigger"
      />
    </CardContent>
  </Card>
</template>
