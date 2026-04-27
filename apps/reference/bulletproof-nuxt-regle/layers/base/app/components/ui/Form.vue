<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, computed, watch, provide, reactive } from "vue";
import { useRegleSchema } from "@regle/schemas";
import type { ZodSchema } from "zod";
import { cn } from "~base/app/lib/utils";

interface Props {
  schema: ZodSchema;
  class?: HTMLAttributes["class"];
  id?: string;
  initialValues?: Record<string, unknown>;
  keepValuesOnUnmount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  keepValuesOnUnmount: true,
  class: undefined,
  id: undefined,
  initialValues: undefined,
});

const emit = defineEmits<{
  submit: [values: Record<string, unknown>];
}>();

// Create reactive state from initialValues or empty object
const state = reactive<Record<string, unknown>>(
  props.initialValues ? { ...props.initialValues } : {},
);

// Use Regle with Zod schema
const { r$ } = useRegleSchema(state, props.schema);

// Provide regle instance to child components
provide("regle", r$);

// Watch for changes in initialValues and reset form
watch(
  () => props.initialValues,
  (newValues) => {
    if (newValues) {
      r$.$reset({ toState: newValues });
    }
  },
  { deep: true },
);

const formState = computed(() => ({
  errors: r$.$errors,
  isSubmitting: r$.$pending,
}));

const onFormSubmit = async (e: Event) => {
  e.preventDefault();
  const result = await r$.$validate();
  if (result.valid) {
    emit("submit", result.data as Record<string, unknown>);
  }
};

const resetForm = (options?: { values?: Record<string, unknown> }) => {
  if (options?.values) {
    r$.$reset({ toState: options.values });
  }
  else {
    r$.$reset({ toInitialState: true });
  }
};

const setValues = (values: Record<string, unknown>) => {
  Object.keys(values).forEach((key) => {
    state[key] = values[key];
  });
};

const setFieldValue = (field: string, value: unknown) => {
  state[field] = value;
};

// Expose form methods for parent components and tests
defineExpose({
  resetForm,
  formState,
  setValues,
  setFieldValue,
  r$,
});
</script>

<template>
  <form
    :id="id"
    :class="cn('space-y-6', props.class)"
    @submit="onFormSubmit"
  >
    <slot
      :form-state="formState"
      :reset-form="resetForm"
    />
  </form>
</template>
