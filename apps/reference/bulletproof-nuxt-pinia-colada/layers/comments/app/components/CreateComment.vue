<script setup lang="ts">
import { reactive, ref } from "vue";
import { useMutation } from "@pinia/colada";
import { Plus } from "lucide-vue-next";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Textarea } from "~~/app/components/ui/textarea";
import { Button } from "~~/app/components/ui/button";
import { createCommentMutation } from "~comments/app/queries/comments";
import { createCommentInputSchema, type CreateCommentInput } from "~comments/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface CreateCommentProps {
  disabled?: boolean;
  discussionId: string;
}

const props = defineProps<CreateCommentProps>();

const { addNotification } = useNotifications();
const { isLoading, mutateAsync } = useMutation(createCommentMutation());
const isDone = ref(false);

const state = reactive<CreateCommentInput>({
  body: "",
  discussionId: props.discussionId,
});

const handleSubmit = async (event: FormSubmitEvent<CreateCommentInput | undefined>) => {
  if (props.disabled || isLoading.value) return;

  const values = event.data ?? state;
  isDone.value = false;

  try {
    await mutateAsync(values);
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "Comment Created",
  });
  isDone.value = true;
};
</script>

<template>
  <FormDrawer
    :is-done="isDone"
    :is-pending="isLoading"
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
      :disabled="props.disabled || isLoading"
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
        :is-loading="isLoading"
      >
        Submit
      </Button>
    </template>
  </FormDrawer>
</template>
