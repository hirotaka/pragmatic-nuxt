<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
} from "reka-ui";
import { ChevronDown } from "lucide-vue-next";
import FieldWrapper from "./FieldWrapper.vue";
import { HiddenField } from "@formwerk/core";

interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  modelValue?: string;
  disabled?: boolean;
  name: string;
  id?: string;
  label?: string;
  options?: SelectOption[];
  placeholder?: string;
  description?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  modelValue: undefined,
  id: undefined,
  label: undefined,
  options: () => [],
  placeholder: "Select an option",
  description: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const internalValue = ref(props.modelValue);

const handleUpdate = (value: string) => {
  internalValue.value = value;
  emit("update:modelValue", value);
};

// Sync modelValue prop to internal value
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== undefined && newValue !== internalValue.value) {
      internalValue.value = newValue;
    }
  },
);

const selectValue = computed(() => {
  return internalValue.value ?? props.modelValue;
});
</script>

<template>
  <component
    :is="label ? FieldWrapper : 'div'"
    :label="label"
    :label-for="id || name"
    :description="description"
  >
    <!-- Hidden field for formwerk form integration -->
    <HiddenField
      :name="name"
      :value="selectValue"
    />

    <SelectRoot
      :model-value="selectValue"
      :disabled="disabled"
      @update:model-value="handleUpdate"
    >
      <!-- If using slot (for SimpleSelect compatibility) -->
      <slot v-if="!options || options.length === 0" />

      <!-- If using options prop -->
      <template v-else>
        <SelectTrigger
          :id="id || name"
          class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SelectValue :placeholder="placeholder" />
          <ChevronDown class="h-4 w-4 opacity-50" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent
            position="popper"
            class="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
          >
            <SelectViewport class="p-1">
              <SelectItem
                v-for="option in options"
                :key="option.value"
                :value="option.value"
                class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <SelectItemText>{{ option.label }}</SelectItemText>
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </template>
    </SelectRoot>
  </component>
</template>
