<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";

import { PencilIcon } from "@heroicons/vue/24/solid";

type UpdateDiscussionProps = {
  discussionId: string;
};

const validationSchema = toFormValidator(
  z.object({
    title: z.string().min(1, "Required"),
    body: z.string().min(1, "Required"),
  })
);

const props = defineProps<UpdateDiscussionProps>();

const { data: discussion } = useDiscussion({
  discussionId: props.discussionId,
});
const { isLoading, isSuccess, mutateAsync } = useUpdateDiscussion();

async function onSubmit(values) {
  await mutateAsync({ data: values, discussionId: props.discussionId });
}
</script>

<template>
  <AppAuthorizationProvider :allowed-roles="[ROLES.ADMIN]">
    <FormDrawer title="Update Discussion" :is-done="isSuccess">
      <template #triggerButton>
        <BaseButton size="sm">
          <template #startIcon>
            <PencilIcon class="h-4 w-4" />
          </template>
          Update Discussion
        </BaseButton>
      </template>
      <template #submitButton>
        <BaseButton
          type="submit"
          form="update-discussion"
          size="sm"
          :is-loading="isLoading"
        >
          Submit
        </BaseButton>
      </template>
      <FormWrapper
        id="update-discussion"
        :validation-schema="validationSchema"
        @submit="onSubmit"
      >
        <FormInputField
          name="title"
          label="Title"
          :value="discussion.title"
          type="text"
        />
        <FormTextareaField name="body" label="Body" :value="discussion.body" />
      </FormWrapper>
    </FormDrawer>
  </AppAuthorizationProvider>
</template>
