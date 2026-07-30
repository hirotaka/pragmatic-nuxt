<script setup lang="ts">
import { onScopeDispose, reactive, ref } from "vue";
import { Plus } from "lucide-vue-next";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Textarea } from "~~/app/components/ui/textarea";
import { Button } from "~~/app/components/ui/button";
import { useCreateComment } from "~comments/app/composables/useCreateComment";
import { createCommentInputSchema, type CreateCommentInput } from "~comments/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface CreateCommentProps {
  disabled?: boolean;
  discussionId: string;
  refresh: () => Promise<void>;
}

const props = defineProps<CreateCommentProps>();

const { addNotification } = useNotifications();
const createComment = useCreateComment();
const isPending = ref(false);
const isDone = ref(false);
let isDisposed = false;

onScopeDispose(() => {
  isDisposed = true;
});

const state = reactive<CreateCommentInput>({
  body: "",
  discussionId: props.discussionId,
});

const handleSubmit = async (event: FormSubmitEvent<CreateCommentInput | undefined>) => {
  if (props.disabled || isPending.value) return;

  const values = event.data ?? state;
  isPending.value = true;
  isDone.value = false;

  try {
    await createComment({
      body: values.body,
      discussionId: values.discussionId,
    });
  }
  catch {
    // `$api` reports the request failure.
    if (!isDisposed) isPending.value = false;
    return;
  }
  if (isDisposed) return;

  addNotification({
    type: "success",
    title: "Comment Created",
  });
  // The read owner reports refresh failures without changing mutation success.
  await props.refresh().catch(() => undefined);
  if (isDisposed) return;

  isDone.value = true;
  isPending.value = false;
};
</script>

<template>
  <FormDrawer
    :is-done="isDone"
    :is-pending="isPending"
    title="Create Comment"
  >
    <template #triggerButton>
      <Button
        :disabled="props.disabled"
        variant="outline"
        size="sm"
      >
        <template #icon>
          <Plus class="size-4" />
        </template>
        Create Comment
      </Button>
    </template>

    <Form
      id="create-comment"
      :schema="createCommentInputSchema"
      :state="state"
      :disabled="props.disabled || isPending"
      class="space-y-6"
      @submit="handleSubmit"
    >
      <FormField
        v-slot="field"
        name="body"
        label="Body"
      >
        <Textarea
          v-model="state.body"
          v-bind="field"
        />
      </FormField>
    </Form>
    <template #submitButton>
      <Button
        :disabled="props.disabled"
        type="submit"
        form="create-comment"
        size="sm"
        :is-loading="isPending"
      >
        Submit
      </Button>
    </template>
  </FormDrawer>
</template>
