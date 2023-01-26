<script setup lang="ts">
import { useField } from 'vee-validate'

import type { FieldWrapperProps } from './FormFieldWrapper.vue'

// TODO: Label to React.Node
type Option = {
  label: string
  value: string | number | string[]
}

interface SelectFieldProps extends FieldWrapperProps {
  name: string
  label: string
  options?: Option[]
  value?: string
  placeholder?: string
  registration?: undefined
}

// TODO: Maybe, should use vite-plugin-vue-type-imports
//  https://github.com/wheatjs/vite-plugin-vue-type-imports
const props = defineProps<SelectFieldProps>()

const options = props.options || []
const {
  value: inputValue,
  errorMessage,
  handleBlur,
  handleChange
} = useField(props.name, undefined, {
  initialValue: props.value || options[0].value
})
</script>

<template>
  <FormFieldWrapper :label="label" :error-message="errorMessage">
    <select
      :id="name"
      :name="name"
      :value="inputValue"
      class="
        mt-1
        block
        w-full
        pl-3
        pr-10
        py-2
        text-base
        border-gray-600
        focus:outline-none
        focus:ring-blue-500
        focus:border-blue-500
        sm:text-sm
        rounded-md
      "
      @blur="handleBlur"
      @change="handleChange"
    >
      <option v-for="{ label: l, value: v } in options" :key="l" :value="v">
        {{ l }}
      </option>
    </select>
  </FormFieldWrapper>
</template>
