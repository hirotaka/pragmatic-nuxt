<script setup lang="ts">
import { useField } from 'vee-validate'
import { computed } from 'vue'

import FieldWrapper from '../form/field-wrapper.vue'

import { cn } from '@/utils/cn'

type InputProps = {
  name: string
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  label?: string
  class?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  disabled: false,
  readonly: false,
})

// Integrate with VeeValidate
const { value, errorMessage } = useField<string>(() => props.name)

const inputClass = computed(() =>
  cn(
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    props.class,
  ),
)
</script>

<template>
  <FieldWrapper :label="label" :error="errorMessage">
    <input
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :class="inputClass"
    />
  </FieldWrapper>
</template>
