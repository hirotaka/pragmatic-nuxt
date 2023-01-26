<script setup lang="ts">
import { useRoute } from 'vue-router'

const { params } = useRoute()
const id = params.id as string
</script>

<template>
  <AppContentWrapper>
    <FeatureDiscussionDetail :discussion-id="id" />
  </AppContentWrapper>
</template>
