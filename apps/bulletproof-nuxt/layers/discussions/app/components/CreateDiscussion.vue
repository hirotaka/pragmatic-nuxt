<script setup lang="ts">
import { reactive, ref } from "vue";
import { Plus } from "lucide-vue-next";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Input } from "~~/app/components/ui/input";
import { Textarea } from "~~/app/components/ui/textarea";
import { Button } from "~~/app/components/ui/button";
import { useCreateDiscussion } from "~discussions/app/composables/useCreateDiscussion";
import {
  createDiscussionInputSchema,
  type CreateDiscussionInput,
} from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const { addNotification } = useNotifications();
const props = defineProps<{
  refresh: () => Promise<void>;
}>();
const createDiscussion = useCreateDiscussion();
const isPending = ref(false);
const isDone = ref(false);

const state = reactive<CreateDiscussionInput>({
  title: "",
  body: "",
});

const handleSubmit = async (event: FormSubmitEvent<CreateDiscussionInput | undefined>) => {
  const values = event.data ?? state;

  isPending.value = true;
  isDone.value = false;
  try {
    await createDiscussion(values);
  }
  catch {
    // `$api` reports the request failure; keep the drawer open for another attempt.
    isPending.value = false;
    return;
  }

  addNotification({
    type: "success",
    title: "Discussion Created",
  });
  // The read owner reports refresh failures without changing mutation success.
  await props.refresh().catch(() => undefined);
  isDone.value = true;
  isPending.value = false;
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
