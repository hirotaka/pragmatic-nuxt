<script setup lang="ts" generic="TState = unknown, TSchema = unknown, TOutput = FormSchemaOutput<TSchema, TState>">
import type { HTMLAttributes } from "vue";
import type {
  FormErrorEvent,
  FormSchemaOutput,
  FormSubmitEvent,
  FormValidate,
} from "./form-types";
import { computed, provide, ref, toRef, watchEffect } from "vue";
import { cn } from "@/lib/utils";
import {
  findFormErrors,
  FORM_CONTEXT_KEY,
  getSchemaErrors,
  touchSchemaField,
  validateWithSchema,
} from "./form-utils";

export interface FormProps<
  TState = unknown,
  TSchema = unknown,
  TOutput = FormSchemaOutput<TSchema, TState>,
> {
  id?: string;
  state?: TState;
  schema?: TSchema;
  validate?: FormValidate<TState>;
  disabled?: boolean;
  loadingAuto?: boolean;
  onSubmit?: (event: FormSubmitEvent<TOutput>) => Promise<void> | void;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<FormProps<TState, TSchema, TOutput>>(), {
  disabled: false,
  loadingAuto: true,
  id: undefined,
  state: undefined,
  schema: undefined,
  validate: undefined,
  onSubmit: undefined,
  class: undefined,
});

defineOptions({
  name: "StackhackerForm",
});

const emit = defineEmits<{
  error: [event: FormErrorEvent<TState | undefined>];
}>();

defineSlots<{
  default(props: { loading: boolean }): unknown;
}>();

const errors = ref<FormErrorEvent["errors"]>([]);
const isSubmitting = ref(false);
const loading = computed(() => props.loadingAuto && isSubmitting.value);
const state = toRef(props, "state");
const disabled = computed(() => props.disabled || loading.value);

watchEffect(() => {
  const schemaErrors = getSchemaErrors(props.schema);
  if (schemaErrors) errors.value = schemaErrors;
});

async function runValidation(event?: Event) {
  const result = props.validate
    ? {
        data: props.state as unknown as TOutput,
        errors: await props.validate(props.state as TState),
      }
    : await validateWithSchema<TOutput>(props.schema, props.state);

  errors.value = result.errors;
  if (event && result.errors.length) {
    emit("error", {
      originalEvent: event,
      errors: result.errors,
      data: props.state,
    });
  }
  return result;
}

async function validateForm(event?: Event) {
  return (await runValidation(event)).errors;
}

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const result = await runValidation(event);
    if (result.errors.length) return;

    await props.onSubmit?.({
      originalEvent: event,
      data: result.data as TOutput,
    });
  }
  finally {
    isSubmitting.value = false;
  }
}

provide(FORM_CONTEXT_KEY, {
  errors,
  disabled,
  state,
  validate: validateForm,
  getFieldErrors: (name, errorPattern) => findFormErrors(errors.value, name, errorPattern),
  touchField: name => touchSchemaField(props.schema, name),
});
</script>

<template>
  <form
    :id="id"
    novalidate
    data-slot="form"
    :data-disabled="disabled ? '' : undefined"
    :class="cn(props.class)"
    @submit="handleSubmit"
  >
    <slot :loading="loading" />
  </form>
</template>
