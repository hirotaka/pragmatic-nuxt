<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, inject, useId } from "vue";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { FORM_CONTEXT_KEY } from "../form";

export interface FormFieldProps {
  name?: string;
  errorPattern?: RegExp;
  label?: string;
  description?: string;
  help?: string;
  hint?: string;
  error?: string | boolean;
  required?: boolean;
  orientation?: "vertical" | "horizontal" | "responsive";
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<FormFieldProps>(), {
  orientation: "vertical",
  name: undefined,
  errorPattern: undefined,
  label: undefined,
  description: undefined,
  help: undefined,
  hint: undefined,
  error: undefined,
  required: false,
  class: undefined,
});

const form = inject(FORM_CONTEXT_KEY, null);
const baseId = useId();

const controlId = computed(() => props.name ? `${props.name.replace(/[^a-zA-Z0-9_-]/g, "-")}-${baseId}` : `field-${baseId}`);
const descriptionId = computed(() => `${controlId.value}-description`);
const helpId = computed(() => `${controlId.value}-help`);
const errorId = computed(() => `${controlId.value}-error`);

const contextErrors = computed(() => form?.getFieldErrors(props.name, props.errorPattern) ?? []);
const errorMessage = computed(() => {
  if (typeof props.error === "string") return props.error;
  if (props.error === true) return "Invalid value.";
  return contextErrors.value[0]?.message;
});
const invalid = computed(() => Boolean(errorMessage.value));
const describedBy = computed(() => [
  props.description ? descriptionId.value : undefined,
  props.help && !invalid.value ? helpId.value : undefined,
  invalid.value ? errorId.value : undefined,
].filter(Boolean).join(" ") || undefined);
const slotProps = computed(() => ({
  "id": controlId.value,
  "name": props.name,
  "disabled": form?.disabled.value ?? false,
  "aria-invalid": invalid.value ? "true" : undefined,
  "aria-describedby": describedBy.value,
}));
</script>

<template>
  <Field
    data-slot="form-field"
    :data-invalid="invalid ? '' : undefined"
    :data-disabled="form?.disabled.value ? '' : undefined"
    :orientation="orientation"
    :class="cn(props.class)"
  >
    <div class="flex items-center justify-between gap-2">
      <FieldLabel
        v-if="label || $slots.label"
        :for="controlId"
        :class="required && 'after:text-destructive after:ms-0.5 after:content-[\'*\']'"
      >
        <slot name="label">
          {{ label }}
        </slot>
      </FieldLabel>

      <span
        v-if="hint || $slots.hint"
        data-slot="form-field-hint"
        class="text-muted-foreground text-sm"
      >
        <slot name="hint">
          {{ hint }}
        </slot>
      </span>
    </div>

    <FieldDescription
      v-if="description || $slots.description"
      :id="descriptionId"
    >
      <slot name="description">
        {{ description }}
      </slot>
    </FieldDescription>

    <div data-slot="form-field-control">
      <slot v-bind="slotProps" />
    </div>

    <FieldError
      v-if="invalid || $slots.error"
      :id="errorId"
      :error="errorMessage"
    >
      <slot name="error">
        {{ errorMessage }}
      </slot>
    </FieldError>

    <FieldDescription
      v-else-if="help || $slots.help"
      :id="helpId"
      data-slot="form-field-help"
    >
      <slot name="help">
        {{ help }}
      </slot>
    </FieldDescription>
  </Field>
</template>
