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
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<FormProps<TState>>(), {
  validateOn: () => ["blur"],
  disabled: false,
  id: undefined,
  state: undefined,
  schema: undefined,
  validate: undefined,
  class: undefined,
});

defineOptions({
  name: "StackhackerForm",
});

const emit = defineEmits<{
  submit: [event: FormSubmitEvent<TState | undefined>];
  error: [event: FormErrorEvent<TState | undefined>];
}>();

const errors = ref<FormErrorEvent["errors"]>([]);
const state = toRef(props, "state");
const disabled = computed(() => props.disabled);

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

async function onSubmit(event: SubmitEvent) {
  event.preventDefault();

  const nextErrors = await validateForm(event);
  if (nextErrors.length) return;

  emit("submit", {
    originalEvent: event,
    data: props.state,
  });
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
    @submit="onSubmit"
    @input.capture="onInput"
    @change.capture="onChange"
    @blur.capture="onBlur"
  >
    <slot />
  </form>
</template>
