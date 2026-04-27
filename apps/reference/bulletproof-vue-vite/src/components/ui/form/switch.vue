<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { useField } from 'vee-validate'
import { computed } from 'vue'

import FieldWrapper from '../form/field-wrapper.vue'

import { cn } from '@/utils/cn'

type SwitchProps = {
  name: string
  label?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<SwitchProps>(), {
  disabled: false,
})

// Integrate with VeeValidate
const { value, errorMessage } = useField<boolean>(() => props.name)

const switchClass = computed(() =>
  cn(
    'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
    props.class,
  ),
)

const thumbClass = computed(() =>
  cn(
    'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
    'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
  ),
)
</script>

<template>
  <FieldWrapper :label="label" :error="errorMessage">
    <SwitchRoot v-model="value" :disabled="disabled" :class="switchClass">
      <SwitchThumb :class="thumbClass" />
    </SwitchRoot>
  </FieldWrapper>
</template>
