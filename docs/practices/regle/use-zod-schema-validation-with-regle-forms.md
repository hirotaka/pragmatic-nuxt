---
title: Use Zod Schema Validation with Regle Forms
semanticId: use-zod-schema-validation-with-regle-forms
category: form-validation
status: confirmed
---

# Use Zod Schema Validation with Regle Forms

## Practice

In a full-stack Nuxt application, prefer Zod when using Regle with a schema library. A Zod schema describes the data accepted by the form and can also validate the request body in the corresponding server route. The form state holds the values currently entered in the form. Regle supports creating a schema-specific composable that can be shared across forms. Forms use this composable for the Regle–Zod integration, giving them a consistent way to create and use Regle validation state.

## Apply When

- A full-stack Nuxt application validates the same submitted data in a form and in the request body of the corresponding server route.
- The form validates all submitted fields together with a Zod schema.
- Multiple forms use the same schema-specific composable and Regle options for their Regle–Zod integration.

## Do Not Apply When

- A form and its corresponding server route intentionally accept different data and require separate schemas.
- A user interaction validates one field or section independently before form submission, such as checking username availability or advancing a multi-step form. Regle Rules provide field-level or section-level validation for this flow.
- Required validation cannot be expressed by a Zod schema that Regle can consume through Standard Schema.
- Forms require different Regle schema options and therefore require separate schema-specific composables.

## Why

Regle supports several schema libraries through [Standard Schema](https://standardschema.dev/). Zod is useful in a full-stack Nuxt application because the same schema can validate data in a form and the corresponding request body in the server route. The server still performs its own validation rather than trusting the browser.

Forms use the same schema-specific composable for the Regle–Zod integration. The composable applies the same Regle options, and changes to the integration can be made in one place.

## Implementation Guidance

- Register `@regle/nuxt` in the root Nuxt configuration.
- Create one schema-specific composable with `defineRegleSchemaConfig()` and keep shared Regle options there. For example, disable `autoDirty` when fields should reveal errors only after field interaction or form submission.
- Place a Zod schema in the feature's `shared/` directory when a form and its corresponding server route validate the same submitted data. Use the same schema to validate the server route's request body.
- In each form, create the form state and pass it with the Zod schema to the schema-specific composable. Use the returned `r$` as the Regle validation state.
- Bind form controls to `r$.$value`.
- Submit the data returned by a successful `r$.$validate()` call. Enable `syncState` explicitly when Zod defaults or transforms should update the form state.

## Minimal Nuxt Example

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@regle/nuxt"],
});
```

```ts
// app/composables/useFormSchema.ts
import { defineRegleSchemaConfig } from "@regle/schemas";

const { useRegleSchema } = defineRegleSchemaConfig({
  modifiers: {
    autoDirty: false,
  },
});

export const useFormSchema = useRegleSchema;
```

```ts
// shared/schemas/tasks.ts
import { z } from "zod";

export const createTaskInputSchema = z.object({
  title: z.string().trim().min(1),
});

export type CreateTaskFormState = z.input<typeof createTaskInputSchema>;
export type CreateTaskInput = z.output<typeof createTaskInputSchema>;
```

```ts
// server/api/tasks/index.post.ts
import { createTaskInputSchema } from "~~/shared/schemas/tasks";

export default defineEventHandler(async (event) => {
  const input = await readValidatedBody(event, createTaskInputSchema.parse);
  await createTask(input);
});
```

```vue
<!-- app/components/CreateTaskForm.vue -->
<script setup lang="ts">
import { reactive } from "vue";
import {
  createTaskInputSchema,
  type CreateTaskFormState,
} from "~~/shared/schemas/tasks";

const state = reactive<CreateTaskFormState>({ title: "" });
const { r$ } = useFormSchema(state, createTaskInputSchema);

async function handleSubmit() {
  const { valid, data } = await r$.$validate();
  if (!valid) return;

  await createTask(data);
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <label for="task-title">Title</label>
    <input
      id="task-title"
      v-model="r$.$value.title"
      aria-describedby="task-title-errors"
      :aria-invalid="r$.title.$error"
      @blur="r$.title.$touch()"
    >
    <div id="task-title-errors" aria-live="polite">
      <p v-for="error in r$.title.$errors" :key="error">
        {{ error }}
      </p>
    </div>

    <button type="submit">
      Create task
    </button>
  </form>
</template>
```

## App Examples

- [`useFormSchema.ts`](../../../apps/bulletproof-nuxt/app/composables/useFormSchema.ts) creates the schema-specific composable used by the forms and disables `autoDirty`.
- [`comments/shared/schemas.ts`](../../../apps/bulletproof-nuxt/layers/comments/shared/schemas.ts) defines a Zod schema shared by the form and server route.
- [`CreateCommentForm.vue`](../../../apps/bulletproof-nuxt/layers/comments/app/components/CreateCommentForm.vue) passes its form state and the shared Zod schema to the schema-specific composable.
- [`comments/index.post.ts`](../../../apps/bulletproof-nuxt/layers/comments/server/api/comments/index.post.ts) validates the request body with the same Zod schema.

## Trade-offs and Limitations

`useRegleSchema` validates a form with its Zod schema instead of the Regle Rules used by `useRegle`. Schema validation parses the entire schema tree. A form therefore cannot use nested `$validate()` or `$pending` to validate one field or section and track its pending state independently. Interactions such as username availability checks or step-by-step validation require Regle Rules or separately managed validation state.

`useRegleSchema` also does not expose Regle Rule metadata on nested validation states such as `r$.email`. The form UI cannot read `$rules.required.active` to derive a required marker or `aria-required`; required presentation metadata must be provided separately from the Zod schema and can drift out of sync.

## Sources

- [Regle: Schema Libraries](https://reglejs.dev/integrations/schemas-libraries)
- [Regle: Standard Schema](https://reglejs.dev/common-usage/standard-schema)
- [Regle: Validation Properties](https://reglejs.dev/core-concepts/validation-properties)
- [Regle: Modifiers](https://reglejs.dev/core-concepts/modifiers)
- [Standard Schema](https://standardschema.dev/schema)
- [Zod](https://zod.dev/)

## Related Practices

No related confirmed Practices are available in this collection yet.
