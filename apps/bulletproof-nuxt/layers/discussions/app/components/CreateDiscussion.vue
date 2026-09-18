<script setup lang="ts">
import { reactive } from "vue";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import { Input } from "~~/app/components/ui/input";
import { Textarea } from "~~/app/components/ui/textarea";
import { useCreateDiscussion } from "~discussions/app/composables/useCreateDiscussion";
import {
  createDiscussionInputSchema,
  type CreateDiscussionInput,
} from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const emit = defineEmits<{
  success: [];
}>();
const { addNotification } = useNotifications();
const createDiscussion = useCreateDiscussion();

const state = reactive<CreateDiscussionInput>({
  title: "",
  body: "",
});
const { r$ } = useRegleSchema(state, createDiscussionInputSchema);

const handleSubmit = async (event: FormSubmitEvent<CreateDiscussionInput | undefined>) => {
  const values = event.data ?? r$.$value;

  try {
    await createDiscussion(values);
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "Discussion Created",
  });
  emit("success");
};
</script>

<template>
  <Form
    id="create-discussion"
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
        type="text"
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
        :rows="5"
      />
    </FormField>
  </Form>
</template>
