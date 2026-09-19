<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Button } from "~~/app/components/ui/button";
import { useDiscussionsSettlement } from "~discussions/app/composables/useDiscussions";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useHead({
  title: "Discussions",
});

const { refreshAfterCreate } = useDiscussionsSettlement();

const handleCreateSuccess = async (close: () => void) => {
  await refreshAfterCreate();
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
          <CreateDiscussionForm @success="handleCreateSuccess(close)" />
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
    <DiscussionsList />
  </LayoutsContentLayout>
</template>
