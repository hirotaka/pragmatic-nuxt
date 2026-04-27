<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, watch, provide, ref, nextTick } from "vue";
import { useForm } from "@tanstack/vue-form";
import type { z } from "zod";
import { cn } from "~base/app/lib/utils";

interface Props {
  schema: z.ZodType;
  class?: HTMLAttributes["class"];
  id?: string;
  initialValues?: Record<string, unknown>;
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  id: undefined,
  initialValues: undefined,
});

const emit = defineEmits<{
  submit: [values: Record<string, unknown>];
}>();

// Error state
const blurErrors = ref<Record<string, string>>({});
const submitErrors = ref<Record<string, string>>({});

// Helper: Extract field errors from Zod validation result
const extractFieldErrors = (issues: z.core.$ZodIssue[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const fieldName = String(issue.path[0]);
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  }
  return errors;
};

// Helper: Clear error for a specific field
const clearFieldError = (
  errorsRef: typeof blurErrors,
  fieldName: string,
) => {
  if (fieldName in errorsRef.value) {
    const { [fieldName]: _, ...rest } = errorsRef.value;
    errorsRef.value = rest;
  }
};

const form = useForm({
  defaultValues: props.initialValues ?? {},
  onSubmit: async ({ value }) => {
    const completeValues = { ...props.initialValues, ...value };
    const result = props.schema.safeParse(completeValues);

    if (!result.success) {
      submitErrors.value = extractFieldErrors(result.error?.issues ?? []);
      return;
    }

    submitErrors.value = {};
    emit("submit", completeValues as Record<string, unknown>);
  },
});

// Set initial values after form is ready
nextTick(() => {
  if (props.initialValues) {
    Object.entries(props.initialValues).forEach(([key, value]) => {
      form.setFieldValue(key, value);
    });
  }
});

// Form state subscription
const extractFormState = () => {
  const state = form.store.state;
  return {
    errors: state.errors || [],
    errorMap: state.errorMap || {},
    fieldMeta: state.fieldMeta || {},
    values: state.values || {},
    isSubmitting: state.isSubmitting || false,
  };
};

const formState = ref(extractFormState());

form.store.subscribe(() => {
  formState.value = extractFormState();
});

// Validate a single field on blur
const validateFieldOnBlur = (fieldName: string) => {
  const result = props.schema.safeParse(form.store.state.values);

  if (!result.success) {
    const fieldError = result.error?.issues.find(
      e => String(e.path[0]) === fieldName,
    );
    if (fieldError) {
      blurErrors.value = { ...blurErrors.value, [fieldName]: fieldError.message };
    }
    else {
      clearFieldError(blurErrors, fieldName);
    }
  }
  else {
    clearFieldError(blurErrors, fieldName);
  }
};

// Watch for initialValues changes
watch(
  () => props.initialValues,
  (newValues) => {
    if (newValues) {
      form.reset({ values: newValues });
    }
  },
  { deep: true },
);

// Unified form context for child components
const formContext = {
  // Form methods
  setFieldValue: form.setFieldValue.bind(form),
  getFieldValue: form.getFieldValue.bind(form),
  handleSubmit: form.handleSubmit.bind(form),
  reset: form.reset.bind(form),
  validateAllFields: form.validateAllFields.bind(form),
  validateFieldOnBlur,

  // Error state
  blurErrors,
  submitErrors,

  // Form state (reactive)
  state: formState,
  get errors() { return formState.value.errors; },
  get errorMap() { return formState.value.errorMap; },
  get fieldMeta() { return formState.value.fieldMeta; },
  get values() { return formState.value.values; },
};

provide("tanstack-form", formContext);

defineExpose({
  resetForm: form.reset.bind(form),
  setValues: (values: Record<string, unknown>) => {
    Object.entries(values).forEach(([key, value]) => {
      form.setFieldValue(key, value);
    });
  },
  setFieldValue: form.setFieldValue.bind(form),
  formState,
  form,
});
</script>

<template>
  <form
    :id="id"
    :class="cn('space-y-6', props.class)"
    @submit.prevent.stop="form.handleSubmit()"
  >
    <slot
      :form-state="formState"
      :reset-form="form.reset.bind(form)"
      :form="form"
    />
  </form>
</template>
