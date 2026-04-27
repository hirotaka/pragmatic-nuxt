<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, computed, watch } from "vue";
import { useForm } from "@formwerk/core";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { cn } from "~base/app/lib/utils";

type GenericObject = Record<string, unknown>;

interface Props {
  schema: StandardSchemaV1<GenericObject>;
  class?: HTMLAttributes["class"];
  id?: string;
  initialValues?: GenericObject;
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  id: undefined,
  initialValues: undefined,
});

const emit = defineEmits<{
  submit: [values: GenericObject];
}>();

const { handleSubmit, isSubmitting, setValue, reset } = useForm({
  schema: props.schema,
  initialValues: props.initialValues,
});

// Watch for changes in initialValues and reset form
watch(
  () => props.initialValues,
  (newValues) => {
    if (newValues) {
      reset();
      Object.entries(newValues).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  },
  { deep: true },
);

const formState = computed(() => ({
  isSubmitting: isSubmitting.value,
}));

const onFormSubmit = handleSubmit((data) => {
  emit("submit", data.toObject());
});

const resetForm = () => {
  reset();
};

// Expose form methods for parent components and tests
defineExpose({
  resetForm,
  formState,
  setValue,
});
</script>

<template>
  <form
    :id="id"
    :class="cn('space-y-6', props.class)"
    novalidate
    @submit="onFormSubmit"
  >
    <slot
      :form-state="formState"
      :reset-form="resetForm"
    />
  </form>
</template>
