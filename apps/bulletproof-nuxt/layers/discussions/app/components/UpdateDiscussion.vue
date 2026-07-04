<script setup lang="ts">
import { Pen } from "lucide-vue-next";
import { computed, reactive, watch, toRef } from "vue";
import { Form, type FormSubmitEvent } from "@/components/form";
import { FormField } from "@/components/form-field";
import FormDrawer from "~~/components/app/FormDrawer.vue";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpdateDiscussion } from "~discussions/app/composables/useUpdateDiscussion";
import { useDiscussion } from "~discussions/app/composables/useDiscussion";
import { updateDiscussionInputSchema, type UpdateDiscussionInput } from "~discussions/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

interface UpdateDiscussionProps {
  discussionId: string;
}

const props = defineProps<UpdateDiscussionProps>();

const { addNotification } = useNotifications();
const { isAdmin } = useUser();

const discussion = useDiscussion(toRef(props, "discussionId"));
const discussionData = computed(() => discussion.data.value.discussion);

const updateDiscussion = useUpdateDiscussion({
  onSuccess: async () => {
    addNotification({
      type: "success",
      title: "Discussion Updated",
    });
    await refreshNuxtData();
  },
});

const initialValues = computed(() => ({
  title: discussionData.value?.title ?? "",
  body: discussionData.value?.body ?? "",
}));

const state = reactive<UpdateDiscussionInput>({
  title: "",
  body: "",
});

watch(
  initialValues,
  (values) => {
    state.title = values.title;
    state.body = values.body;
  },
  { immediate: true },
);

const handleSubmit = async (event: FormSubmitEvent<UpdateDiscussionInput | undefined>) => {
  const values = event.data ?? state;

  try {
    await updateDiscussion.mutate({
      id: props.discussionId,
      data: values,
    });
  }
  catch {
    // Error is already handled in the composable
  }
};
</script>

<template>
  <div v-if="isAdmin">
    <FormDrawer
      :is-done="updateDiscussion.isSuccess.value"
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
        :disabled="updateDiscussion.isPending.value"
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
          :is-loading="updateDiscussion.isPending.value"
        >
          Submit
        </Button>
      </template>
    </FormDrawer>
  </div>
</template>
