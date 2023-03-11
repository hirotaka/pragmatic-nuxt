<script setup lang="ts">
import AppContentWrapper from '~/components/app/AppContentWrapper.vue'
import FeatureDiscussionCreate from '~/components/feature/discussion/FeatureDiscussionCreate.vue'
import FeatureDiscussionList from '~/components/feature/discussion/FeatureDiscussionList.vue'
</script>

<template>
  <AppContentWrapper title="Discussions">
    <div class="flex justify-end">
      <FeatureDiscussionCreate />
    </div>
    <div class="mt-4">
      <FeatureDiscussionList />
    </div>
  </AppContentWrapper>
</template>
