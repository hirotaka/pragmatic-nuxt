<script lang="ts">
/* eslint-disable import/order */
import type { ZodSchema } from 'zod'

export type FormProps = {
  schema: ZodSchema
  initialValues?: Record<string, unknown>
  class?: string
  keepValuesOnUnmount?: boolean
}
</script>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed } from 'vue'

import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<FormProps>(), {
  keepValuesOnUnmount: true,
})

const emit = defineEmits<{
  submit: [values: Record<string, unknown>]
}>()

const validationSchema = computed(() => toTypedSchema(props.schema))

const form = useForm({
  validationSchema: validationSchema.value,
  initialValues: props.initialValues,
  keepValuesOnUnmount: props.keepValuesOnUnmount,
})

const { handleSubmit, errors, isSubmitting, resetForm, defineField } = form

// Create a register function similar to react-hook-form
const register = (name: string) => {
  const [field, fieldProps] = defineField(name)
  return {
    name,
    modelValue: field,
    ...fieldProps,
  }
}

// Create formState object similar to react-hook-form
const formState = computed(() => ({
  errors: errors.value,
  isSubmitting: isSubmitting.value,
}))

const onSubmit = handleSubmit((values: Record<string, unknown>) => {
  emit('submit', values)
})

defineExpose({
  resetForm,
  errors,
})
</script>

<template>
  <form @submit="onSubmit" :class="cn('space-y-6', $props.class)" v-bind="$attrs">
    <slot
      :register="register"
      :formState="formState"
      :errors="errors"
      :is-submitting="isSubmitting"
    ></slot>
  </form>
</template>
