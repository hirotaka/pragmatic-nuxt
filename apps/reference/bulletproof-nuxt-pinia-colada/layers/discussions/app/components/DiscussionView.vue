<script setup lang="ts">
import MarkdownPreview from "~~/app/components/app/MarkdownPreview.vue";
import { Card, CardContent, CardHeader } from "~~/app/components/ui/card";
import { useQuery } from "@pinia/colada";
import UpdateDiscussion from "./UpdateDiscussion.vue";
import { formatDate } from "#layers/base/app/utils/format";
import { discussionDetailQuery } from "~discussions/app/queries/discussions";

interface DiscussionViewProps {
  discussionId: string;
}

const props = defineProps<DiscussionViewProps>();
const { data: discussion } = useQuery(() => discussionDetailQuery({
  id: props.discussionId,
}));
</script>

<template>
  <Card v-if="discussion">
    <CardHeader>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1 text-sm text-muted-foreground">
          <span>{{ formatDate(discussion.createdAt) }}</span>
          <span v-if="discussion.author">
            by {{ discussion.author.firstName }} {{ discussion.author.lastName }}
          </span>
        </div>
        <UpdateDiscussion
          :key="discussion.id"
          :discussion-id="discussion.id"
        />
      </div>
    </CardHeader>
    <CardContent>
      <div class="prose prose-neutral max-w-none text-sm dark:prose-invert">
        <MarkdownPreview :value="discussion.body" />
      </div>
    </CardContent>
  </Card>
</template>
