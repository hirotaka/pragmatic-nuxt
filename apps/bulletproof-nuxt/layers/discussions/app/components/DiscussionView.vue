<script setup lang="ts">
import { Pen } from "lucide-vue-next";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import MarkdownPreview from "~~/app/components/app/MarkdownPreview.vue";
import { Button } from "~~/app/components/ui/button";
import { Card, CardContent, CardHeader } from "~~/app/components/ui/card";
import UpdateDiscussion from "./UpdateDiscussion.vue";
import { formatDate } from "#layers/base/app/utils/format";
import { useDiscussion } from "~discussions/app/composables/useDiscussion";
import { useUser } from "#layers/auth/app/composables/useUser";

interface DiscussionViewProps {
  discussionId: string;
}

const props = defineProps<DiscussionViewProps>();
const { isAdmin } = useUser();

const { data: discussion, refresh } = await useDiscussion(() => props.discussionId);
</script>

<template>
  <Card v-if="discussion">
    <CardHeader>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1 text-sm text-muted-foreground">
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
              <template #icon>
                <Pen class="size-4" />
              </template>
              Update Discussion
            </Button>
          </template>

          <template #default="{ close }">
            <UpdateDiscussion
              :body="discussion.body"
              :discussion-id="discussion.id"
              :refresh="refresh"
              :title="discussion.title"
              @success="close"
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
      <div class="prose prose-neutral max-w-none text-sm dark:prose-invert">
        <MarkdownPreview :value="discussion.body" />
      </div>
    </CardContent>
  </Card>
</template>
