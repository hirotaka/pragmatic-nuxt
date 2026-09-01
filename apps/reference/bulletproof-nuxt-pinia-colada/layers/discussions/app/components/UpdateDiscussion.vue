<script setup lang="ts">
import { useMutation, useQuery } from "@pinia/colada";
import { Pen } from "lucide-vue-next";
import { reactive } from "vue";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Input } from "~~/app/components/ui/input";
import { Textarea } from "~~/app/components/ui/textarea";
import { Button } from "~~/app/components/ui/button";
import { discussionDetailQuery, updateDiscussionMutation } from "~discussions/app/queries/discussions";
import { updateDiscussionInputSchema, type UpdateDiscussionInput } from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

interface UpdateDiscussionProps {
  discussionId: string;
}

const props = defineProps<UpdateDiscussionProps>();

const { addNotification } = useNotifications();
const { isAdmin } = useUser();
const { data: discussion } = useQuery(() => discussionDetailQuery({
  id: props.discussionId,
}));
const {
  isLoading,
  mutateAsync,
  status,
} = useMutation(updateDiscussionMutation());

const state = reactive<UpdateDiscussionInput>({
  title: discussion.value?.title ?? "",
  body: discussion.value?.body ?? "",
});

const handleSubmit = async (event: FormSubmitEvent<UpdateDiscussionInput | undefined>) => {
  if (isLoading.value) return;

  const values = event.data ?? state;

  try {
    await mutateAsync({
      id: props.discussionId,
      data: values,
    });
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "Discussion Updated",
  });
};
</script>

<template>
  <div v-if="isAdmin && discussion">
    <FormDrawer
      :is-done="status === 'success'"
      :is-pending="isLoading"
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

      <Form
        id="update-discussion"
        :schema="updateDiscussionInputSchema"
        :state="state"
        :disabled="isLoading"
        class="space-y-6"
        @submit="handleSubmit"
      >
        <FormField
          v-slot="field"
          name="title"
          label="Title"
        >
          <Input
            v-model="state.title"
            v-bind="field"
          />
        </FormField>
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
          form="update-discussion"
          size="sm"
          :is-loading="isLoading"
        >
          Submit
        </Button>
      </template>
    </FormDrawer>
  </div>
</template>
