<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { useTextField } from "@formwerk/core";
import { cn } from "~base/app/lib/utils";
import FieldWrapper from "./FieldWrapper.vue";

interface Props {
  name: string;
  type?: "text" | "password" | "email" | "tel" | "url";
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  label?: string;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  readonly: false,
  placeholder: undefined,
  label: undefined,
  class: undefined,
});

const { inputProps, errorMessage, isTouched } = useTextField({
  name: props.name,
  label: props.label ?? props.name,
  type: props.type,
  disabled: props.disabled,
  readonly: props.readonly,
});

const error = computed(() => isTouched.value ? errorMessage.value : undefined);

const inputClass = computed(() =>
  cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    error.value && "border-destructive",
    props.class,
  ),
);
</script>

<template>
  <FieldWrapper
    :label="label"
    :error="error"
  >
    <input
      v-bind="inputProps"
      :placeholder="placeholder"
      :class="inputClass"
    >
  </FieldWrapper>
</template>
