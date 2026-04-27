<script setup lang="ts">
import { useField } from 'vee-validate'
import { computed } from 'vue'

import FieldWrapper from '../form/field-wrapper.vue'

import { cn } from '@/utils/cn'

export interface Option {
  label: string
  value: string | number
}

type SelectProps = {
  name: string
  options: Option[]
  label?: string
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<SelectProps>(), {
  disabled: false,
})

// Integrate with VeeValidate
const { value, errorMessage } = useField<string | number>(() => props.name)

const selectClass = computed(() =>
  cn(
    'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
    'ring-offset-background placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-1 focus:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    props.class,
  ),
)
</script>

<template>
  <FieldWrapper :label="label" :error="errorMessage">
    <select v-model="value" :disabled="disabled" :class="selectClass">
      <option v-if="placeholder" value="" disabled selected>
        {{ placeholder }}
      </option>
      <option v-for="option in options" :key="String(option.value)" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </FieldWrapper>
</template>
