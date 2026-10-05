<script setup lang="ts">
import { Pen } from "@lucide/vue";
import { useUser } from "#layers/auth/app/composables/useUser";

interface DiscussionViewProps {
  discussionId: string;
}

const props = defineProps<DiscussionViewProps>();
const { isAdmin } = useUser();

const { data: discussion, refresh } = await useDiscussion(() => props.discussionId);

const handleUpdateSuccess = async (close: () => void) => {
  await refresh().catch(() => undefined);
  close();
};
</script>

<template>
  <Card v-if="discussion">
    <CardHeader>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex flex-col gap-1 text-sm text-muted-foreground">
          <span>{{ formatDate(discussion.createdAt) }}</span>
          <span v-if="discussion.author">
            by {{ discussion.author.firstName }} {{ discussion.author.lastName }}
          </span>
        </div>
        <FormDrawer
          v-if="isAdmin"
          title="Update Discussion"
        >
          <template #triggerButton>
            <Button
              variant="outline"
              size="sm"
            >
              <Pen
                data-icon="inline-start"
                aria-hidden="true"
              />
              Update Discussion
            </Button>
          </template>

          <template #default="{ close }">
            <UpdateDiscussionForm
              :body="discussion.body"
              :discussion-id="discussion.id"
              :title="discussion.title"
              @success="handleUpdateSuccess(close)"
            />
          </template>

          <template #submitButton>
            <Button
              type="submit"
              form="update-discussion"
              size="sm"
            >
              Submit
            </Button>
          </template>
        </FormDrawer>
      </div>
    </CardHeader>
    <CardContent>
      <MarkdownPreview
        :value="discussion.body"
        class="text-sm"
      />
    </CardContent>
  </Card>
</template>
