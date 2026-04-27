<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, ref, onMounted, watch, nextTick, computed } from "vue";
import { useTextField } from "@formwerk/core";
import { cn } from "~base/app/lib/utils";
import FieldWrapper from "./FieldWrapper.vue";

interface Props {
  class?: HTMLAttributes["class"];
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  name: string;
  label?: string;
  rows?: number;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  rows: 3,
  autoResize: false,
  minRows: 3,
  class: undefined,
  placeholder: undefined,
  label: undefined,
  maxRows: undefined,
});

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const { inputProps, errorMessage, fieldValue, isTouched } = useTextField({
  name: props.name,
  label: props.label ?? props.name,
  disabled: props.disabled,
  readonly: props.readonly,
});

const error = computed(() => isTouched.value ? errorMessage.value : undefined);

const adjustHeight = () => {
  if (!props.autoResize || !textareaRef.value) return;

  const textarea = textareaRef.value;

  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = "auto";

  // Calculate new height based on content
  let newHeight = textarea.scrollHeight;

  // Apply min/max constraints if provided
  if (props.minRows) {
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const minHeight = lineHeight * props.minRows;
    newHeight = Math.max(newHeight, minHeight);
  }

  if (props.maxRows) {
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const maxHeight = lineHeight * props.maxRows;
    newHeight = Math.min(newHeight, maxHeight);
  }

  textarea.style.height = `${newHeight}px`;
};

// Initialize auto-resize on mount and when value changes
onMounted(() => {
  if (props.autoResize) {
    nextTick(() => {
      adjustHeight();
    });
  }
});

watch(
  () => fieldValue.value,
  () => {
    if (props.autoResize) {
      nextTick(() => {
        adjustHeight();
      });
    }
  },
);
</script>

<template>
  <FieldWrapper
    :label="label"
    :error="error"
  >
    <textarea
      ref="textareaRef"
      v-bind="inputProps"
      :class="
        cn(
          'flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          autoResize && 'resize-none overflow-hidden',
          error && 'border-destructive',
          props.class,
        )
      "
      :placeholder="placeholder"
      :rows="autoResize ? minRows : rows"
      @input="autoResize && adjustHeight()"
    />
  </FieldWrapper>
</template>
