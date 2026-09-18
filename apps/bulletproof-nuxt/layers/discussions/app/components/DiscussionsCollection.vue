<script setup lang="ts">
import { computed, ref } from "vue";
import { Plus } from "lucide-vue-next";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Button } from "~~/app/components/ui/button";
import { useDiscussions } from "~discussions/app/composables/useDiscussions";

const currentPage = ref(1);
const limit = 10;
const { data, status, refresh } = await useDiscussions({ page: currentPage, limit });
const discussions = computed(() => Array.isArray(data.value?.data) && data.value.meta
  ? data.value
  : undefined);

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleCreateSuccess = async (close: () => void) => {
  await refresh().catch(() => undefined);
  close();
};
</script>

<template>
  <LayoutsContentLayout
    title="Discussions"
    description="Create, update, and moderate team discussions."
  >
    <template #actions>
      <FormDrawer title="Create Discussion">
        <template #triggerButton>
          <Button
            variant="outline"
            size="sm"
          >
            <template #icon>
              <Plus class="size-4" />
            </template>
            Create Discussion
          </Button>
        </template>

        <template #default="{ close }">
          <CreateDiscussion @success="handleCreateSuccess(close)" />
        </template>

        <template #submitButton>
          <Button
            type="submit"
            form="create-discussion"
            size="sm"
          >
            Submit
          </Button>
        </template>
      </FormDrawer>
    </template>
    <DiscussionsList
      v-if="discussions"
      :discussions="discussions"
      :is-pending="status === 'pending'"
      :refresh="refresh"
      @page-change="handlePageChange"
    />
  </LayoutsContentLayout>
</template>
