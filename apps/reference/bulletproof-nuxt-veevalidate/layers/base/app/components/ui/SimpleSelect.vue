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
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select an option",
  disabled: false,
  name: undefined,
  class: undefined,
});

const model = defineModel<string>();
</script>

<template>
  <Select
    :id="name"
    v-model="model"
    :disabled="disabled"
    :name="name"
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
