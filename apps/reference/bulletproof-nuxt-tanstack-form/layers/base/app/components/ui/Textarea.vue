<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { type HTMLAttributes, computed, ref, onMounted, watch, nextTick } from "vue";
import { cn } from "~base/app/lib/utils";
import { useFormField } from "~base/app/composables/useFormField";
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

// Use form field composable if name is provided
const formField = props.name ? useFormField<string>(() => props.name!) : null;

// Get/set field value
const fieldValue = computed({
  get: () => {
    if (formField) {
      return formField.value.value || props.modelValue || "";
    }
    return props.modelValue || "";
  },
  set: (newValue: string) => {
    if (formField) {
      formField.value.value = newValue;
    }
    emit("update:modelValue", newValue);
  },
});

const fieldError = computed(() => formField?.errorMessage.value);

const adjustHeight = () => {
  if (!props.autoResize || !textareaRef.value) return;

  const textarea = textareaRef.value;
  textarea.style.height = "auto";

  let newHeight = textarea.scrollHeight;

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
  emit("input", event);

  // Sync value with form field
  if (formField) {
    formField.value.value = target.value;
  }

  if (props.autoResize) {
    adjustHeight();
  }
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleBlurEvent = (event: FocusEvent) => {
  emit("blur", event);
  formField?.handleBlur();
};

onMounted(() => {
  if (props.autoResize) {
    nextTick(() => adjustHeight());
  }
});

watch(
  () => fieldValue.value,
  () => {
    if (props.autoResize) {
      nextTick(() => adjustHeight());
    }
  },
);
</script>

<template>
  <FieldWrapper
    :label="label"
    :error="fieldError"
  >
    <textarea
      :id="name"
      ref="textareaRef"
      v-model="fieldValue"
      :class="cn(
        'flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        autoResize && 'resize-none overflow-hidden', props.class,
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
