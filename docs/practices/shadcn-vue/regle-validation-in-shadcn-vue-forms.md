---
title: Regle Validation in shadcn-vue Forms
semanticId: regle-validation-in-shadcn-vue-forms
category: form-validation
status: confirmed
---

# Regle Validation in shadcn-vue Forms

## Practice

A form built with shadcn-vue components and Regle keeps form state and validation in Regle while shadcn-vue components present the controls, labels, and errors. Regle field values bind to input components, and `FieldError` displays validation messages.

## Apply When

- A form already uses Regle for validation and is adopting shadcn-vue components for its UI.
- A new form in a shadcn-vue application uses Regle for form state and validation.
- A form built with shadcn-vue components switches from another form library, such as VeeValidate or TanStack Form, to Regle.

## Do Not Apply When

- Another form library remains responsible for form state and validation, and the form is not moving to Regle.

## Why

The shadcn-vue Forms guide documents VeeValidate, TanStack Form, and Formisch, but not Regle. The shadcn-vue `Form` component wraps VeeValidate and uses its form state, while the `Field` family groups controls, labels, and errors without managing validation. This separation lets Regle manage form state and validation while shadcn-vue components provide the form UI.

## Implementation Guidance

- The form component creates Regle state and renders a native `<form>` with shadcn-vue form controls and `Field` components.
- Each Regle `$fields` entry supplies its `$value` to the component that holds the value and its `$errors` to `FieldError`. Error messages are mapped to the installed `FieldError` component's accepted `errors` shape when necessary.
- Each `FieldLabel`'s `for` matches its form control's `id`. `Field` carries `data-invalid`, and form controls such as `Input`, `SelectTrigger`, and `Checkbox` carry `aria-invalid`. When an error is shown, the control's `aria-describedby` references the `FieldError` element's `id`.
- The form calls the Regle field's `$touch()` on control blur or change when errors should appear. On submit, it calls root `r$.$validate()` and passes only valid returned data to the feature's operation; the form or feature handles pending state, duplicate prevention, and success or failure feedback.

## Minimal Nuxt Example

```vue
<!-- app/components/ContactForm.vue -->
<script setup lang="ts">
import { reactive } from "vue"
import { useRegleSchema } from "@regle/schemas"
import { z } from "zod"

const emit = defineEmits<{ submit: [email: string] }>()
const schema = z.object({ email: z.string().email() })
const { r$ } = useRegleSchema(reactive({ email: "" }), schema)
const email = r$.$fields.email

async function submit() {
  const { valid, data } = await r$.$validate()
  if (valid) emit("submit", data.email)
}
</script>

<template>
  <form novalidate @submit.prevent="submit">
    <Field :data-invalid="email.$error ? 'true' : undefined">
      <FieldLabel for="contact-email">Email</FieldLabel>
      <Input
        id="contact-email"
        v-model="email.$value"
        type="email"
        :aria-invalid="email.$error ? 'true' : undefined"
        :aria-describedby="email.$error ? 'contact-email-error' : undefined"
        @blur="email.$touch()"
      />
      <FieldError
        v-if="email.$error"
        id="contact-email-error"
        :errors="email.$errors.map(message => ({ message }))"
      />
    </Field>
    <Button type="submit">Submit</Button>
  </form>
</template>
```

The form reads the Regle field directly, links its label and error to the control, and emits only validated data. The parent component listening for the emitted `submit` event runs the request and handles pending state and failures. `novalidate` prevents browser constraint validation from blocking the submit handler. Regle handles client-side validation, and `FieldError` displays its messages.

## App Examples

- [`LoginForm.vue`](../../../apps/bulletproof-nuxt/layers/auth/app/components/LoginForm.vue) binds Regle field values and errors to Field, Input, and FieldError in a native form.
- [`RegisterForm.vue`](../../../apps/bulletproof-nuxt/layers/auth/app/components/RegisterForm.vue) uses Checkbox to choose which Regle-validated team field is shown.
- [`FieldError.vue`](../../../apps/bulletproof-nuxt/app/components/ui/field/FieldError.vue) renders string validation messages passed from Regle.

## Trade-offs and Limitations

shadcn-vue's `Field` components do not read Regle state. The form explicitly connects each displayed Regle field's value, invalid state, and errors to shadcn-vue components. Additional fields follow the same pattern; form state and validation remain with Regle.

## Sources

- [shadcn-vue: Forms](https://www.shadcn-vue.com/docs/forms)
- [shadcn-vue: Form](https://www.shadcn-vue.com/docs/components/form)
- [shadcn-vue: Field](https://www.shadcn-vue.com/docs/components/field)
- [shadcn-vue: TanStack Form](https://www.shadcn-vue.com/docs/forms/tanstack-form)
- [Regle: Schema Libraries](https://reglejs.dev/integrations/schemas-libraries)

## Related Practices

- [Use Zod Schema Validation with Regle Forms](../regle/use-zod-schema-validation-with-regle-forms.md)
- [Reuse Validation and Submission Handling](../regle/reuse-validation-and-submission-handling.md)
- [Keep Installed shadcn-vue Components Unmodified](keep-installed-shadcn-vue-components-unmodified.md)
