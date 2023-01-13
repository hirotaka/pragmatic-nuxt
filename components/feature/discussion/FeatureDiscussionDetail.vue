<script setup lang="ts">
type FeaturesDiscussionDetailProps = {
  discussionId: string;
};

const props = defineProps<FeaturesDiscussionDetailProps>();
const { data, isLoading } = useDiscussion({ discussionId: props.discussionId });
</script>

<template>
  <AppSuspense :is-loading="isLoading">
    <template #fallback>
      <div class="w-full h-48 flex justify-center items-center">
        <BaseSpinner size="lg" />
      </div>
    </template>
    <h1 class="text-3xl font-semibold text-gray-900">{{ data.title }}</h1>
    <span class="text-xs font-bold">
      {{ formatDate(data.createdAt) }}
    </span>
    <div class="mt-6 flex flex-col space-y-16">
      <div class="flex justify-end">
        <FeatureDiscussionUpdate :discussion-id="data.id" />
      </div>
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <div class="mt-1 max-w-2xl text-sm text-gray-500">
            <BaseMDPreview :value="data.body" />
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-1xl font-bold">Comments:</h3>
        <FeatureCommentCreate :discussion-id="data.id" />
      </div>
      <FeatureCommentList :discussion-id="data.id" />
    </div>
  </AppSuspense>
</template>
