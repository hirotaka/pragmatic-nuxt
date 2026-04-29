<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, computed, watch } from "vue";
import { useForm, type GenericObject } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import type { ZodSchema } from "zod";
import { cn } from "~base/app/lib/utils";

interface Props {
  schema: ZodSchema;
  class?: HTMLAttributes["class"];
  id?: string;
  initialValues?: GenericObject;
  keepValuesOnUnmount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  keepValuesOnUnmount: true,
  class: undefined,
  id: undefined,
  initialValues: undefined,
});

const emit = defineEmits<{
  submit: [values: GenericObject];
}>();

const { handleSubmit, errors, isSubmitting, resetForm, setValues, setFieldValue } = useForm({
  validationSchema: toTypedSchema(props.schema),
  initialValues: props.initialValues,
  keepValuesOnUnmount: props.keepValuesOnUnmount,
});

// Watch for changes in initialValues and reset form
watch(
  () => props.initialValues,
  (newValues) => {
    if (newValues) {
      resetForm({ values: newValues });
    }
  },
  { deep: true },
);

const formState = computed(() => ({
  errors: errors.value,
  isSubmitting: isSubmitting.value,
}));

const onFormSubmit = handleSubmit(async (values) => {
  emit("submit", values);
});

// Expose form methods for parent components and tests
defineExpose({
  resetForm,
  formState,
  setValues,
  setFieldValue,
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
