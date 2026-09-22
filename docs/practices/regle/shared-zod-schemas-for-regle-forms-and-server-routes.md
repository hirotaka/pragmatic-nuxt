---
title: Shared Zod Schemas for Regle Forms and Server Routes
semanticId: shared-zod-schemas-for-regle-forms-and-server-routes
category: form-validation
status: confirmed
---

# Shared Zod Schemas for Regle Forms and Server Routes

## Practice

In a Nuxt full-stack application, a form that uses Regle and a Zod schema can share that schema with the server route that receives its submission. Regle validates data in the form, while the server route independently validates the request body. Types derived from the schema make the distinction between editing input and parsed submission data explicit.

## Apply When

- A form that uses Regle with Zod sends data to a server route that accepts the same input contract.
- The form and server route need the same structural validation rules.
- The Regle integration accepts the Zod schema used by the form.
- The schema's input and output types represent the form's editing state and parsed submission data.

## Do Not Apply When

- The form state and the server route request body need separate schemas.
- The form submits to an API outside the Nuxt full-stack application.

## Why

Form validation can give feedback before data is submitted. In a Nuxt full-stack application, the server route can validate its request body with the same Zod schema.

When the form and server route use the same schema, changes to structural validation rules can be made in one place. This arrangement can reduce differences between the form and server route.

## Implementation Guidance

- A shared module exports a Zod schema that both the form and server route import.
- `z.input<typeof schema>` represents form state before parsing, and `z.output<typeof schema>` represents parsed submission data.
- `useRegleSchema` applies the schema to form state, and `$validate()` supplies parsed data after successful validation.
- The server route uses `safeParse()` on the request body before its domain work begins.

## Minimal Nuxt Example

```ts
// shared/schemas/task.ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1),
});

export type CreateTaskFormState = z.input<typeof createTaskSchema>;
export type CreateTaskInput = z.output<typeof createTaskSchema>;
```

The Zod schema provides types for form state and parsed submission data.

```vue
<!-- app/components/CreateTaskForm.vue -->
<script setup lang="ts">
import { reactive } from "vue";
import { useRegleSchema } from "@regle/schemas";
import {
  createTaskSchema,
  type CreateTaskFormState,
  type CreateTaskInput,
} from "~/shared/schemas/task";

const state = reactive<CreateTaskFormState>({ title: "" });
const { r$ } = useRegleSchema(state, createTaskSchema);

async function submit() {
  const { valid, data } = await r$.$validate();
  if (!valid) return;

  await $fetch("/api/tasks", {
    method: "POST",
    body: data satisfies CreateTaskInput,
  });
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="r$.$value.title">
    <button type="submit">Create task</button>
  </form>
</template>
```

`useRegleSchema` validates the form state, and `$validate()` returns parsed data before `$fetch` sends it.

```ts
// server/api/tasks/index.post.ts
import { createTaskSchema } from "~/shared/schemas/task";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const result = createTaskSchema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid task" });
  }

  return { task: result.data };
});
```

`safeParse()` validates the request body with the same Zod schema.

## App Examples

- [`schemas.ts`](../../../apps/bulletproof-nuxt/layers/auth/shared/schemas.ts) exports the Zod schema and its input and output types.
- [`LoginForm.vue`](../../../apps/bulletproof-nuxt/layers/auth/app/components/LoginForm.vue) passes form state and `loginInputSchema` to the Regle schema integration.
- [`login.post.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/api/auth/login.post.ts) validates the request body with `loginInputSchema`.
- [`index.post.ts`](../../../apps/bulletproof-nuxt/layers/comments/server/api/comments/index.post.ts) validates comment creation data with `createCommentInputSchema`.

## Trade-offs and Limitations

A change to a Zod schema used by both a form and server route changes validation in both places. The schema therefore represents rules that suit the values users enter and the data the server accepts.

A schema imported by the form and server route runs in both browser and server environments. Checks that use database records, session data, or other information available only on the server run in the server route after request-body validation.

## Sources

- [Zod: Basic usage](https://zod.dev/basics)
- [Regle: Schema Libraries](https://reglejs.dev/integrations/schemas-libraries)
- [Nuxt: Server directory](https://nuxt.com/docs/4.x/directory-structure/server)

## Related Practices

- [Use Zod Schema Validation with Regle Forms](use-zod-schema-validation-with-regle-forms.md) explains the Regle and Zod form integration used at the browser boundary.
- [Reuse Validation and Submission Handling](reuse-validation-and-submission-handling.md) explains how a reusable form component can pass validated data to feature submission code.
