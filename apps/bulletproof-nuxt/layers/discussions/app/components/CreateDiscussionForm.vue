<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { Form, type FormSubmitEvent } from "@/components/form";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateDiscussion } from "~discussions/app/composables/useCreateDiscussion";
import {
  createDiscussionInputSchema,
  type CreateDiscussionInput,
} from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const emit = defineEmits<{
  success: [discussionId: string];
}>();

const router = useRouter();
const { addNotification } = useNotifications();

const createDiscussion = useCreateDiscussion({
  onSuccess: (discussion) => {
    addNotification({
      type: "success",
      title: "Discussion Created",
    });
    emit("success", discussion.id);
    router.push(`/app/discussions/${discussion.id}`);
  },
});

const state = reactive<CreateDiscussionInput>({
  title: "",
  body: "",
});

const handleSubmit = async (event: FormSubmitEvent<CreateDiscussionInput | undefined>) => {
  const values = event.data ?? state;

  try {
    await createDiscussion.mutate(values);
  }
  catch {
    // Error is already handled in the composable
  }
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">
      Create New Discussion
    </h2>

    <Form
      :schema="createDiscussionInputSchema"
      :state="state"
      :disabled="createDiscussion.isPending.value"
      class="space-y-6"
      @submit="handleSubmit"
    >
      <div
        v-if="createDiscussion.error.value"
        class="mb-4 text-sm text-destructive"
        role="alert"
      >
        {{ createDiscussion.error.value.message }}
      </div>

      <FormField
        v-slot="field"
        name="title"
        label="Title"
      >
        <Input
          v-model="state.title"
          v-bind="field"
          type="text"
          placeholder="Enter discussion title (3-200 characters)"
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
          placeholder="Enter discussion body (minimum 10 characters)"
          :rows="8"
        />
      </FormField>

      <div class="flex gap-2">
        <Button
          :is-loading="createDiscussion.isPending.value"
          type="submit"
          class="flex-1"
        >
          Submit
        </Button>
        <Button
          variant="outline"
          type="button"
          @click="router.push('/app/discussions')"
        >
          Cancel
        </Button>
      </div>
    </Form>
  </div>
</template>
