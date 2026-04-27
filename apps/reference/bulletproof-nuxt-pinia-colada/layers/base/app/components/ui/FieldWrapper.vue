<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useSlots, computed } from "vue";
import Label from "./Label.vue";
import FieldError from "./FieldError.vue";

interface Props {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  class?: HTMLAttributes["class"];
  htmlFor?: string;
}

const props = defineProps<Props>();
const slots = useSlots();

// Auto-generate htmlFor from the first input/select/textarea in the slot if not provided
const labelFor = computed(() => {
  if (props.htmlFor) return props.htmlFor;

  // Try to extract name from slot content
  const defaultSlot = slots.default?.();
  if (defaultSlot && defaultSlot.length > 0) {
    const firstNode = defaultSlot[0];
    // Check if it's an Input/Select/Textarea component with a name prop
    if (firstNode && firstNode.props && "name" in firstNode.props) {
      return firstNode.props.name as string;
    }
  }

  return undefined;
});
</script>

<template>
  <div :class="props.class">
    <Label
      v-if="label"
      :for="labelFor"
      :required="required"
      :error="!!error"
    >
      {{ label }}
      <div class="mt-1">
        <slot />
      </div>
    </Label>
    <div
      v-else
      class="mt-1"
    >
      <slot />
    </div>
    <p
      v-if="description"
      class="mt-1 text-sm text-muted-foreground"
    >
      {{ description }}
    </p>
    <FieldError
      v-if="error"
      :message="error"
      class="mt-1"
    />
  </div>
</template>
