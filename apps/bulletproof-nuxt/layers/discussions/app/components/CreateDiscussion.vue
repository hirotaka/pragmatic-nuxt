<script setup lang="ts">
import { reactive } from "vue";
import { Plus } from "lucide-vue-next";
import { Form, type FormSubmitEvent } from "@/components/form";
import { FormField } from "@/components/form-field";
import FormDrawer from "~~/components/app/FormDrawer.vue";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateDiscussion } from "~discussions/app/composables/useCreateDiscussion";
import {
  createDiscussionInputSchema,
  type CreateDiscussionInput,
} from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const { addNotification } = useNotifications();

const createDiscussion = useCreateDiscussion({
  onSuccess: async () => {
    addNotification({
      type: "success",
      title: "Discussion Created",
    });
    await refreshNuxtData();
  },
});

const state = reactive<CreateDiscussionInput>({
  title: "",
  body: "",
});

const handleSubmit = async (event: FormSubmitEvent<CreateDiscussionInput | undefined>) => {
  const values = event.data ?? state;

  await createDiscussion.mutate(values);
};
</script>

<template>
  <FormDrawer
    :is-done="createDiscussion.isSuccess.value"
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
      :disabled="createDiscussion.isPending.value"
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
        :is-loading="createDiscussion.isPending.value"
      >
        Submit
      </Button>
    </template>
  </FormDrawer>
</template>
