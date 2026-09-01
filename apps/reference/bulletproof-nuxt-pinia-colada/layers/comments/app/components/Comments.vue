<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/app/components/ui/card";

interface CommentsProps {
  discussionId: string;
}

const props = defineProps<CommentsProps>();
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Comments</CardTitle>
          <CardDescription>Continue the discussion with your team.</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <CommentsList
        :key="props.discussionId"
        :discussion-id="props.discussionId"
      />
    </CardContent>
  </Card>
</template>
