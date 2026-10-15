<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { Plus } from "@lucide/vue";

interface CommentsProps {
  discussionId: string;
}

const props = defineProps<CommentsProps>();
const { refresh } = await useCommentList(props.discussionId);

const handleCreateSuccess = async (close: () => void) => {
  await refresh();
  close();
};
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Comments</CardTitle>
          <CardDescription>Continue the discussion with your team.</CardDescription>
        </div>
        <FormDrawer
          :key="props.discussionId"
          title="Create Comment"
        >
          <template #triggerButton>
            <Button
              variant="outline"
              size="sm"
            >
              <Plus
                data-icon="inline-start"
                aria-hidden="true"
              />
              Create Comment
            </Button>
          </template>

          <template #default="{ close }">
            <CommentCreateForm
              :discussion-id="props.discussionId"
              @success="handleCreateSuccess(close)"
            />
          </template>

          <template #submitButton>
            <Button
              type="submit"
              form="create-comment"
              size="sm"
            >
              Submit
            </Button>
          </template>
        </FormDrawer>
      </div>
    </CardHeader>
    <CardContent>
      <CommentList
        :key="props.discussionId"
        :discussion-id="props.discussionId"
      />
    </CardContent>
  </Card>
</template>
