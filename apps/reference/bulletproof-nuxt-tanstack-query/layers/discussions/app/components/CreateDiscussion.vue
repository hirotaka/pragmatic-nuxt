<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { Plus } from "lucide-vue-next";
import { onScopeDispose, reactive, ref } from "vue";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Input } from "~~/app/components/ui/input";
import { Textarea } from "~~/app/components/ui/textarea";
import { Button } from "~~/app/components/ui/button";
import {
  createDiscussionMutation,
  invalidateDiscussionLists,
} from "~discussions/app/queries/discussions";
import {
  createDiscussionInputSchema,
  type CreateDiscussionInput,
} from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const { addNotification } = useNotifications();
const queryClient = useQueryClient();
const { isPending, mutateAsync } = useMutation(createDiscussionMutation());
const isDone = ref(false);
let isDisposed = false;

onScopeDispose(() => {
  isDisposed = true;
});

const state = reactive<CreateDiscussionInput>({
  title: "",
  body: "",
});

const handleSubmit = async (event: FormSubmitEvent<CreateDiscussionInput | undefined>) => {
  if (isPending.value) return;

  const values = event.data ?? state;
  isDone.value = false;

  try {
    await mutateAsync(values);
  }
  catch {
    // `$api` reports request failures; leave the drawer and its draft ready to retry.
    return;
  }
  if (isDisposed) return;

  addNotification({
    type: "success",
    title: "Discussion Created",
  });
  isDone.value = true;

  // Synchronization is intentionally detached from the committed write.
  void invalidateDiscussionLists(queryClient).catch(() => undefined);
};
</script>

<template>
  <FormDrawer
    :is-done="isDone"
    :is-pending="isPending"
    title="Create Discussion"
  >
    <template #triggerButton>
      <Button
        variant="outline"
        size="sm"
      >
        <template #icon>
          <Plus class="size-4" />
        </template>
        Create Discussion
      </Button>
    </template>

    <Form
      id="create-discussion"
      :schema="createDiscussionInputSchema"
      :state="state"
      :disabled="isPending"
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
          type="text"
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
          :rows="5"
        />
      </FormField>
    </Form>
    <template #submitButton>
      <Button
        type="submit"
        form="create-discussion"
        size="sm"
        :is-loading="isPending"
      >
        Submit
      </Button>
    </template>
  </FormDrawer>
</template>
