<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";

import { PlusIcon } from "@heroicons/vue/24/outline";

type CreateCommentProps = {
  discussionId: string;
};

const validationSchema = toFormValidator(
  z.object({
    body: z.string().min(1, "Required"),
  })
);

const props = defineProps<CreateCommentProps>();

const { isLoading, isSuccess, mutateAsync } = useCreateComment({
  discussionId: props.discussionId,
});

async function onSubmit(values) {
  const data = {
    ...values,
    discussionId: props.discussionId,
  };
  await mutateAsync({ data });
}
</script>

<template>
  <FormDrawer title="Create Comment" :is-done="isSuccess">
    <template #triggerButton>
      <BaseButton size="sm">
        <template #startIcon>
          <PlusIcon class="h-4 w-4" />
        </template>
        Create Comment
      </BaseButton>
    </template>
    <template #submitButton>
      <BaseButton
        type="submit"
        form="create-comment"
        size="sm"
        :is-loading="isLoading"
      >
        Submit
      </BaseButton>
    </template>
    <FormWrapper
      id="create-comment"
      :validation-schema="validationSchema"
      @submit="onSubmit"
    >
      <FormTextareaField name="body" label="Body" />
    </FormWrapper>
  </FormDrawer>
</template>
