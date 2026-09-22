---
title: Reuse Validation and Submission Handling
semanticId: reuse-validation-and-submission-handling
category: form-validation
status: confirmed
---

# Reuse Validation and Submission Handling

## Practice

Organizing validation and submission handling into a reusable Vue component lets forms share that behavior without repeating the implementation. The component wraps the native `<form>` element, runs validation, disables controls during submission, and prevents duplicate submissions. Each form supplies its validation and submit callbacks, so API requests and any work needed before reporting success can remain in that form or a composable it calls. Handling the success event in the parent component lets it refresh displayed data, close the drawer or modal containing the form, or navigate elsewhere without coupling those actions to the reusable component.

## Apply When

- Multiple forms need the same sequence of validation, disabling controls during submission, and preventing duplicate submissions.
- The forms use different validation schemas or API requests, but those differences can be handled by callbacks without changing the shared submission sequence.
- Actions after success depend on where a form is displayed, such as closing a drawer or navigating from a page.

## Do Not Apply When

- The forms have different validation and submission flows, and a shared component would need separate branches for each form rather than reuse the same behavior.
- An existing form component or library already provides the required validation and submission controls, so another wrapper would duplicate those responsibilities.

## Why

Forms for creating and editing records, such as those in an admin application, often repeat the same validation and submission flow. Keeping that flow in one component avoids implementing it for each form and allows fixes to be applied in one place.

Validation and submit callbacks let forms use different schemas and API requests without adding conditional logic for each form to the reusable component. Handling success in the parent also lets the same form appear in a drawer, a modal, or a page without including their closing or navigation behavior in its submission code.

## Implementation Guidance

- Give the reusable form component a validation function and a submit callback. Run validation first and pass valid, parsed data to the callback.
- Track submission separately from validation. Disable controls and ignore another submit until the callback finishes, then clear the submission state in a `finally` block.
- Put the API request and its error handling in the form's submit callback or a composable it calls. Keep entered values available when a request fails, and emit success only after a successful request.
- Emit a success event after the form completes a successful request.

## Minimal Nuxt Example

```vue
<!-- app/components/Form.vue -->
<script setup lang="ts" generic="T">
import { ref } from "vue";

const props = defineProps<{
  validate: () => Promise<{ valid: true; data: T } | { valid: false }>;
  onSubmit: (data: T) => Promise<void>;
}>();

const submitting = ref(false);

async function handleSubmit() {
  if (submitting.value) return;

  submitting.value = true;
  try {
    const result = await props.validate();
    if (result.valid) await props.onSubmit(result.data);
  }
  finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit">
    <fieldset :disabled="submitting">
      <slot />
    </fieldset>
  </form>
</template>
```

```vue
<!-- app/components/CreateTaskForm.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useRegleSchema } from "@regle/schemas";
import { z } from "zod";
import Form from "./Form.vue";

const emit = defineEmits<{ success: [] }>();
const message = ref("");
const schema = z.object({ title: z.string().trim().min(1) });
const { r$ } = useRegleSchema({ title: "" }, schema);

async function validate() {
  const { valid, data } = await r$.$validate();
  if (!valid) return { valid: false as const };
  return { valid: true as const, data };
}

async function createTask(data: z.output<typeof schema>) {
  message.value = "";
  try {
    await $fetch("/api/tasks", { method: "POST", body: data });
  }
  catch {
    message.value = "The request failed. Check whether the task was saved before retrying.";
    return;
  }
  emit("success");
}
</script>

<template>
  <Form :validate="validate" :on-submit="createTask">
    <label for="task-title">Title</label>
    <input
      id="task-title"
      v-model="r$.$value.title"
      :aria-invalid="r$.title.$error"
      aria-describedby="task-title-errors"
    >
    <div id="task-title-errors" aria-live="polite">
      <p v-for="error in r$.title.$errors" :key="error">{{ error }}</p>
    </div>
    <p role="status">{{ message }}</p>
    <button type="submit">Create task</button>
  </Form>
</template>
```

```vue
<!-- app/pages/tasks/new.vue -->
<script setup lang="ts">
import CreateTaskForm from "~/components/CreateTaskForm.vue";

async function handleCreated() {
  await navigateTo("/tasks");
}
</script>

<template>
  <CreateTaskForm @success="handleCreated" />
</template>
```

## App Examples

- [`Form.vue`](../../../apps/bulletproof-nuxt/app/components/form/Form.vue) runs validation and awaits the supplied submit callback.
- [`CreateCommentForm.vue`](../../../apps/bulletproof-nuxt/layers/comments/app/components/CreateCommentForm.vue) handles comment creation before emitting success.
- [`Comments.vue`](../../../apps/bulletproof-nuxt/layers/comments/app/components/Comments.vue) handles the success event by refreshing the list before closing the drawer.
- [`FormDrawer.vue`](../../../apps/bulletproof-nuxt/app/components/app/FormDrawer.vue) exposes a function for closing the drawer through its default slot.

## Trade-offs and Limitations

A reusable form component can simplify simple forms that validate all submitted data and then create or edit a record. Forms whose validation or submission flow changes during user interaction need an individual implementation.

A form that checks whether an email address is available or validates one step before moving to the next needs field-level or section-level validation in addition to its submit flow. `useRegleSchema` validates the whole schema tree, so those interactions need Regle Rules or separately managed validation state.

## Sources

- [Regle: Schema Libraries](https://reglejs.dev/integrations/schemas-libraries)

## Related Practices

- [Use Zod Schema Validation with Regle Forms](use-zod-schema-validation-with-regle-forms.md) describes using Regle and Zod to validate form data before submission.
