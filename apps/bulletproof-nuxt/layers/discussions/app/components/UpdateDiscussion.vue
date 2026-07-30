<script setup lang="ts">
import { Pen } from "lucide-vue-next";
import { onScopeDispose, reactive, ref, watch } from "vue";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Input } from "~~/app/components/ui/input";
import { Textarea } from "~~/app/components/ui/textarea";
import { Button } from "~~/app/components/ui/button";
import { useDiscussion } from "~discussions/app/composables/useDiscussion";
import { useUpdateDiscussion } from "~discussions/app/composables/useUpdateDiscussion";
import { updateDiscussionInputSchema, type UpdateDiscussionInput } from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

interface UpdateDiscussionProps {
  discussionId: string;
}

const props = defineProps<UpdateDiscussionProps>();

const { addNotification } = useNotifications();
const { isAdmin } = useUser();
const { data: discussion, refresh } = await useDiscussion(() => props.discussionId);

const updateDiscussion = useUpdateDiscussion();
const isPending = ref(false);
const isDone = ref(false);
let isDisposed = false;

onScopeDispose(() => {
  isDisposed = true;
});

const state = reactive<UpdateDiscussionInput>({
  title: "",
  body: "",
});

watch(
  discussion,
  (value) => {
    state.title = value?.title ?? "";
    state.body = value?.body ?? "";
  },
  { immediate: true },
);

const handleSubmit = async (event: FormSubmitEvent<UpdateDiscussionInput | undefined>) => {
  if (isPending.value) return;

  const values = event.data ?? state;

  isPending.value = true;
  isDone.value = false;
  try {
    await updateDiscussion({
      id: props.discussionId,
      data: values,
    });
  }
  catch {
    // `$api` reports the request failure; keep the drawer open for another attempt.
    if (!isDisposed) isPending.value = false;
    return;
  }
  if (isDisposed) return;

  addNotification({
    type: "success",
    title: "Discussion Updated",
  });
  // The read owner reports refresh failures without changing mutation success.
  await refresh().catch(() => undefined);
  if (isDisposed) return;

  isDone.value = true;
  isPending.value = false;
};
</script>

<template>
  <div v-if="isAdmin && discussion">
    <FormDrawer
      :is-done="isDone"
      :is-pending="isPending"
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
          :is-loading="isPending"
        >
          Submit
        </Button>
      </template>
    </FormDrawer>
  </div>
</template>
