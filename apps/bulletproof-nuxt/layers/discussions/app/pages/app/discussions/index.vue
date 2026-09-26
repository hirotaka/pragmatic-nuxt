<script setup lang="ts">
import { Plus } from "lucide-vue-next";

definePageMeta({
  middleware: "auth",
});

useHead({
  title: "Discussions",
});

const { refreshAfterCreate } = await useDiscussions();

const handleCreateSuccess = async (close: () => void) => {
  await refreshAfterCreate();
  close();
};
</script>

<template>
  <PageContent
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
  </PageContent>
</template>
