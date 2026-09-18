<script setup lang="ts" generic="TState = unknown">
import type { HTMLAttributes } from "vue";
import type { FormErrorEvent, FormInputEvent, FormSubmitEvent, FormValidate } from "./form-types";
import { computed, provide, ref, toRef } from "vue";
import { cn } from "@/lib/utils";
import { findFormErrors, FORM_CONTEXT_KEY, validateWithSchema } from "./form-utils";

export interface FormProps<TState = unknown> {
  id?: string;
  state?: TState;
  schema?: unknown;
  validate?: FormValidate<TState>;
  validateOn?: FormInputEvent[];
  disabled?: boolean;
  loadingAuto?: boolean;
  onSubmit?: (event: FormSubmitEvent<TState | undefined>) => Promise<void> | void;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<FormProps<TState>>(), {
  validateOn: () => ["blur"],
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
  submit: [event: FormSubmitEvent<TState | undefined>];
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

async function validateForm(event?: Event) {
  const nextErrors = props.validate
    ? await props.validate(props.state as TState)
    : await validateWithSchema(props.schema, props.state);

  errors.value = nextErrors;
  if (event && nextErrors.length) {
    emit("error", {
      originalEvent: event,
      errors: nextErrors,
      data: props.state,
    });
  }
  return nextErrors;
}

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const nextErrors = await validateForm(event);
    if (nextErrors.length) return;

    await props.onSubmit?.({
      originalEvent: event,
      data: props.state,
    });
  }
  finally {
    isSubmitting.value = false;
  }
}

function shouldValidateOn(type: FormInputEvent) {
  return props.validateOn.includes(type);
}

async function onInput(event: Event) {
  if (shouldValidateOn("input")) await validateForm(event);
}

async function onChange(event: Event) {
  if (shouldValidateOn("change")) await validateForm(event);
}

async function onBlur(event: Event) {
  if (shouldValidateOn("blur")) await validateForm(event);
}

provide(FORM_CONTEXT_KEY, {
  errors,
  disabled,
  state,
  validate: validateForm,
  getFieldErrors: (name, errorPattern) => findFormErrors(errors.value, name, errorPattern),
});
</script>

<template>
  <form
    :id="id"
    data-slot="form"
    :data-disabled="disabled ? '' : undefined"
    :class="cn(props.class)"
    @submit="handleSubmit"
    @input.capture="onInput"
    @change.capture="onChange"
    @blur.capture="onBlur"
  >
    <slot :loading="loading" />
  </form>
</template>
