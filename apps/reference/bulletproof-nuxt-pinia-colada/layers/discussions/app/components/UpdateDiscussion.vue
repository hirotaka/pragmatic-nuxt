<script setup lang="ts">
import { Pen } from "lucide-vue-next";
import { computed, ref, watch, toRef } from "vue";
import { useUpdateDiscussion } from "~discussions/app/composables/useUpdateDiscussion";
import { useDiscussion } from "~discussions/app/composables/useDiscussion";
import { updateDiscussionInputSchema } from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

interface UpdateDiscussionProps {
  discussionId: string;
}

const props = defineProps<UpdateDiscussionProps>();

const { addNotification } = useNotifications();
const { isAdmin } = useUser();
const isOpen = ref(false);

const discussion = useDiscussion(toRef(props, "discussionId"));
const discussionData = computed(() => discussion.data.value);

const updateDiscussion = useUpdateDiscussion({
  onSuccess: () => {
    addNotification({
      type: "success",
      title: "Discussion Updated",
    });
  },
});

const initialValues = computed(() => ({
  title: discussionData.value?.title ?? "",
  body: discussionData.value?.body ?? "",
}));

const handleSubmit = (values: Record<string, unknown>) => {
  updateDiscussion.mutate({
    id: props.discussionId,
    data: values as { title: string; body: string },
  });
};

// Close drawer when form submission is done
watch(
  () => updateDiscussion.isSuccess.value,
  (newValue) => {
    if (newValue) {
      isOpen.value = false;
    }
  },
);
</script>

<template>
  <div v-if="isAdmin">
    <UDrawerRoot v-model:open="isOpen">
      <UDrawerTrigger as-child>
        <UButton size="sm">
          <template #icon>
            <Pen class="size-4" />
          </template>
          Update Discussion
        </UButton>
      </UDrawerTrigger>
      <UDrawerContent class="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
        <div class="flex flex-col">
          <UDrawerHeader>
            <UDrawerTitle>Update Discussion</UDrawerTitle>
          </UDrawerHeader>
          <div>
            <UForm
              id="update-discussion"
              :schema="updateDiscussionInputSchema"
              :initial-values="initialValues"
              @submit="handleSubmit"
            >
              <template #default>
                <UInput
                  name="title"
                  label="Title"
                  :disabled="updateDiscussion.isLoading.value"
                />
                <UTextarea
                  name="body"
                  label="Body"
                  :disabled="updateDiscussion.isLoading.value"
                />
              </template>
            </UForm>
          </div>
        </div>
        <UDrawerFooter>
          <UButton
            variant="outline"
            type="button"
            @click="isOpen = false"
          >
            Close
          </UButton>
          <UButton
            type="submit"
            form="update-discussion"
            :is-loading="updateDiscussion.isLoading.value"
          >
            Submit
          </UButton>
        </UDrawerFooter>
      </UDrawerContent>
    </UDrawerRoot>
  </div>
</template>
