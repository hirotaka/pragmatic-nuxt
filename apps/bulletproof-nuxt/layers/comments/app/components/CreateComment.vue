<script setup lang="ts">
import { reactive, watch } from "vue";
import { Plus } from "lucide-vue-next";
import { Form, type FormSubmitEvent } from "@/components/form";
import { FormField } from "@/components/form-field";
import FormDrawer from "~~/components/app/FormDrawer.vue";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateComment } from "~comments/app/composables/useCreateComment";
import { createCommentInputSchema, type CreateCommentInput } from "~comments/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface CreateCommentProps {
  discussionId: string;
}

const props = defineProps<CreateCommentProps>();
const emit = defineEmits<{
  created: [];
}>();

const { addNotification } = useNotifications();

const createComment = useCreateComment({
  onSuccess: () => {
    addNotification({
      type: "success",
      title: "Comment Created",
    });
    emit("created");
  },
});

const state = reactive<CreateCommentInput>({
  body: "",
  discussionId: props.discussionId,
});

watch(
  () => props.discussionId,
  (discussionId) => {
    state.discussionId = discussionId;
  },
);

const handleSubmit = async (event: FormSubmitEvent<CreateCommentInput | undefined>) => {
  const values = event.data ?? state;

  try {
    await createComment.mutate({
      body: values.body,
      discussionId: values.discussionId,
    });
  }
  catch {
    // Error is surfaced through the mutation notification callbacks.
  }
};
</script>

<template>
  <FormDrawer
    :is-done="createComment.isSuccess.value"
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

    <Form
      id="create-comment"
      :schema="createCommentInputSchema"
      :state="state"
      :disabled="createComment.isPending.value"
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
        type="submit"
        form="create-comment"
        size="sm"
        :is-loading="createComment.isPending.value"
      >
        Submit
      </Button>
    </template>
  </FormDrawer>
</template>
