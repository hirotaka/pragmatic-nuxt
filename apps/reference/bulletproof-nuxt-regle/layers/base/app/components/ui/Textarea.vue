<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, computed, ref, onMounted, watch, nextTick, inject } from "vue";
import { cn } from "~base/app/lib/utils";
import FieldWrapper from "./FieldWrapper.vue";

interface Props {
  modelValue?: string;
  class?: HTMLAttributes["class"];
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  required?: boolean;
  maxlength?: string;
  name?: string;
  label?: string;
  rows?: number;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  required: false,
  rows: 3,
  autoResize: false,
  minRows: 3,
  modelValue: undefined,
  class: undefined,
  placeholder: undefined,
  maxlength: undefined,
  name: undefined,
  label: undefined,
  maxRows: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "input": [event: Event];
  "focus": [event: FocusEvent];
  "blur": [event: FocusEvent];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Inject Regle instance from parent Form
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const r$ = inject<any>("regle", null);

// Get field from regle instance if name is provided
const field = computed(() => props.name && r$ ? r$[props.name] : null);
const errorMessage = computed(() => field.value?.$errors?.[0]);

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

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
  emit("input", event);

  // Update Regle field if name is provided
  if (props.name && r$) {
    r$.$value[props.name] = target.value;
  }

  // Auto-resize if enabled
  if (props.autoResize) {
    adjustHeight();
  }
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleBlurEvent = (event: FocusEvent) => {
  emit("blur", event);
};

// Use Regle value if available, otherwise use modelValue
const textareaValue = computed(() => {
  if (props.name && r$) {
    return r$.$value[props.name] as string | undefined;
  }
  return props.modelValue;
});

// Initialize auto-resize on mount and when value changes
onMounted(() => {
  if (props.autoResize) {
    nextTick(() => {
      adjustHeight();
    });
  }
});

watch(
  () => textareaValue.value,
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
    :error="errorMessage"
  >
    <textarea
      :id="name"
      ref="textareaRef"
      :value="textareaValue"
      :class="
        cn(
          'flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          autoResize && 'resize-none overflow-hidden',
          props.class,
        )
      "
      :disabled="disabled"
      :readonly="readonly"
      :placeholder="placeholder"
      :required="required"
      :maxlength="maxlength"
      :name="name"
      :rows="autoResize ? minRows : rows"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlurEvent"
    />
  </FieldWrapper>
</template>
