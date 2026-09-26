<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { Plus } from "lucide-vue-next";

interface CommentsProps {
  discussionId: string;
}

const props = defineProps<CommentsProps>();
const { refreshAfterCreate } = await useComments(() => props.discussionId);

const handleCreateSuccess = async (close: () => void) => {
  await refreshAfterCreate();
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
              <template #icon>
                <Plus class="size-4" />
              </template>
              Create Comment
            </Button>
          </template>

          <template #default="{ close }">
            <CreateCommentForm
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
      <CommentsList
        :key="props.discussionId"
        :discussion-id="props.discussionId"
      />
    </CardContent>
  </Card>
</template>
