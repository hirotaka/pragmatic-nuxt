<script setup lang="ts">
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();

const discussionId = computed(() => route.params.id as string);
const isHydrating = import.meta.client && useNuxtApp().isHydrating;
const { data: discussion, error } = await useDiscussion(discussionId);

// An SSR read error is in the hydrated fetch result; its server-side hook cannot show a client toast.
if (isHydrating && error.value) {
  onMounted(() => {
    const notification = resolveApiErrorNotification(error.value);
    if (notification) {
      toast.error(notification.title, { description: notification.message });
    }
  });
}

useHead({
  title: computed(() => discussion.value?.title || "Discussion"),
});
</script>

<template>
  <PageContent
    :title="discussion?.title || 'Discussion'"
    description="Read, update, and discuss this team topic."
  >
    <template v-if="discussion">
      <DiscussionView :discussion-id="discussion.id" />
      <div class="mt-6">
        <Comments :discussion-id="discussion.id" />
      </div>
    </template>
  </PageContent>
</template>
