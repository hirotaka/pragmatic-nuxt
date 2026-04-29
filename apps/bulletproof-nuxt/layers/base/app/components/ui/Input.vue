<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, computed, inject } from "vue";
import { cn } from "~base/app/lib/utils";
import FieldWrapper from "./FieldWrapper.vue";

interface Props {
  name: string;
  type?: string;
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

// Inject Regle instance from parent Form
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const r$ = inject<any>("regle");

// Get field from regle instance
const field = computed(() => r$?.[props.name]);
const errorMessage = computed(() => field.value?.$errors?.[0]);

const inputClass = computed(() =>
  cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    props.class,
  ),
);
</script>

<template>
  <FieldWrapper
    :label="label"
    :error="errorMessage"
  >
    <input
      :id="name"
      v-model="r$.$value[name]"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :class="inputClass"
    >
  </FieldWrapper>
</template>
