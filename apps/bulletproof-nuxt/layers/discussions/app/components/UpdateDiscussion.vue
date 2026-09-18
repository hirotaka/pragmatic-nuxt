<script setup lang="ts">
import { reactive, watch } from "vue";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import { Input } from "~~/app/components/ui/input";
import { Textarea } from "~~/app/components/ui/textarea";
import { useUpdateDiscussion } from "~discussions/app/composables/useUpdateDiscussion";
import { updateDiscussionInputSchema, type UpdateDiscussionInput } from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface UpdateDiscussionProps {
  body: string;
  discussionId: string;
  refresh: () => Promise<void>;
  title: string;
}

const props = defineProps<UpdateDiscussionProps>();
const emit = defineEmits<{
  success: [];
}>();
const { addNotification } = useNotifications();
const updateDiscussion = useUpdateDiscussion(() => props.discussionId);

const state = reactive<UpdateDiscussionInput>({
  title: props.title,
  body: props.body,
});
const { r$ } = useRegleSchema(state, updateDiscussionInputSchema);

watch(
  () => [props.title, props.body] as const,
  ([title, body]) => {
    r$.$value.title = title;
    r$.$value.body = body;
  },
);

const handleSubmit = async (event: FormSubmitEvent<UpdateDiscussionInput | undefined>) => {
  const values = event.data ?? r$.$value;

  try {
    await updateDiscussion(values);
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "Discussion Updated",
  });
  await props.refresh().catch(() => undefined);
  emit("success");
};
</script>

<template>
  <Form
    id="update-discussion"
    :schema="r$"
    :state="r$.$value"
    class="space-y-6"
    @submit="handleSubmit"
  >
    <FormField
      v-slot="field"
      name="title"
      label="Title"
    >
      <Input
        v-model="r$.$value.title"
        v-bind="field"
      />
    </FormField>
    <FormField
      v-slot="field"
      name="body"
      label="Body"
    >
      <Textarea
        v-model="r$.$value.body"
        v-bind="field"
      />
    </FormField>
  </Form>
</template>
