<script setup lang="ts">
import Select from "./Select.vue";
import SelectTrigger from "./SelectTrigger.vue";
import SelectValue from "./SelectValue.vue";
import SelectContent from "./SelectContent.vue";
import SelectItem from "./SelectItem.vue";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  modelValue?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select an option",
  disabled: false,
  modelValue: undefined,
  name: undefined,
  class: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const handleUpdate = (value: string) => {
  emit("update:modelValue", value);
};
</script>

<template>
  <Select
    :id="name"
    :model-value="modelValue"
    :disabled="disabled"
    :name="name"
    @update:model-value="handleUpdate"
  >
    <SelectTrigger :class="props.class">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
