<script setup lang="ts">
import { computed, toRef } from "vue";
import MarkdownPreview from "~~/components/app/MarkdownPreview.vue";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import UpdateDiscussion from "./UpdateDiscussion.vue";
import { formatDate } from "#layers/base/app/utils/format";
import { useDiscussion } from "~discussions/app/composables/useDiscussion";

interface DiscussionViewProps {
  discussionId: string;
}

const props = defineProps<DiscussionViewProps>();

const discussion = useDiscussion(toRef(props, "discussionId"));
const discussionData = computed(() => discussion.data.value.discussion);
</script>

<template>
  <Card v-if="discussionData">
    <CardHeader>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1 text-sm text-muted-foreground">
          <span>{{ formatDate(new Date(discussionData.createdAt).getTime()) }}</span>
          <span v-if="discussionData.author">
            by {{ discussionData.author.firstName }} {{ discussionData.author.lastName }}
          </span>
        </div>
        <UpdateDiscussion :discussion-id="props.discussionId" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="prose prose-neutral max-w-none text-sm dark:prose-invert">
        <MarkdownPreview :value="discussionData.body" />
      </div>
    </CardContent>
  </Card>
</template>
