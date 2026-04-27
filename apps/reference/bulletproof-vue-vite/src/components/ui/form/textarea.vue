<script setup lang="ts">
import { useField } from 'vee-validate'
import { computed, ref, watch, nextTick } from 'vue'

import FieldWrapper from '../form/field-wrapper.vue'

import { cn } from '@/utils/cn'

type TextareaProps = {
  name: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  label?: string
  class?: string
  rows?: number
  autoResize?: boolean
}

const props = withDefaults(defineProps<TextareaProps>(), {
  disabled: false,
  readonly: false,
  rows: 3,
  autoResize: false,
})

// Integrate with VeeValidate
const { value, errorMessage } = useField<string>(() => props.name)

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const textareaClass = computed(() =>
  cn(
    'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    props.autoResize ? 'resize-none' : 'resize-y',
    props.class,
  ),
)

// Auto-resize functionality
const adjustHeight = async () => {
  if (!props.autoResize || !textareaRef.value) return

  await nextTick()
  const textarea = textareaRef.value

  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto'

  // Set the height to match the content
  textarea.style.height = `${textarea.scrollHeight}px`
}

// Watch for value changes to adjust height
watch(value, () => {
  if (props.autoResize) {
    adjustHeight()
  }
})

// Adjust height on mount if autoResize is enabled
watch(textareaRef, (newRef) => {
  if (newRef && props.autoResize) {
    adjustHeight()
  }
})

const handleInput = () => {
  if (props.autoResize) {
    adjustHeight()
  }
}
</script>

<template>
  <FieldWrapper :label="label" :error="errorMessage">
    <textarea
      ref="textareaRef"
      v-model="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :class="textareaClass"
      @input="handleInput"
    />
  </FieldWrapper>
</template>
