<script setup lang="ts">
import { computed, toRef } from "vue";
import UpdateDiscussion from "./UpdateDiscussion.vue";
import { formatDate } from "#layers/base/app/utils/format";
import { useDiscussion } from "~discussions/app/composables/useDiscussion";

interface DiscussionViewProps {
  discussionId: string;
}

const props = defineProps<DiscussionViewProps>();

const discussion = useDiscussion(toRef(props, "discussionId"));
const discussionData = computed(() => discussion.data.value);
</script>

<template>
  <div v-if="discussionData">
    <span class="text-xs font-bold">
      {{ formatDate(new Date(discussionData.createdAt).getTime()) }}
    </span>
    <span
      v-if="discussionData.author"
      class="ml-2 text-sm font-bold"
    >
      by {{ discussionData.author.firstName }}
      {{ discussionData.author.lastName }}
    </span>
    <div class="mt-6 flex flex-col space-y-16">
      <div class="flex justify-end">
        <UpdateDiscussion :discussion-id="props.discussionId" />
      </div>
      <div>
        <div class="overflow-hidden bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <div class="mt-1 max-w-2xl text-sm text-gray-500">
              <UMDPreview :value="discussionData.body" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
