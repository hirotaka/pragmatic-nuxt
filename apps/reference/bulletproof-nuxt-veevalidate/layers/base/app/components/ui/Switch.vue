<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  SwitchRoot,
  SwitchThumb,
} from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props {
  class?: HTMLAttributes["class"];
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  checked?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  disabled: false,
  required: false,
  name: undefined,
  value: undefined,
  id: undefined,
  checked: false,
});

const emit = defineEmits<{
  "update:checked": [value: boolean];
}>();

const handleCheckedChange = (value: boolean) => {
  emit("update:checked", value);
};
</script>

<template>
  <SwitchRoot
    :id="props.id"
    :model-value="props.checked"
    :class="
      cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        props.class,
      )
    "
    :disabled="props.disabled"
    :required="props.required"
    :name="props.name"
    :value="props.value"
    @update:model-value="handleCheckedChange"
  >
    <SwitchThumb
      :class="
        cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        )
      "
    />
  </SwitchRoot>
</template>
