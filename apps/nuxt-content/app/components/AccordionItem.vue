<script setup lang="ts">
import { AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";

const props = defineProps<{ label?: string; icon?: string }>();
</script>

<template>
  <AccordionItem :value="label || 'item'">
    <AccordionTrigger>
      <Icon
        v-if="icon"
        :name="icon"
        class="size-4"
      />{{ props.label }}
    </AccordionTrigger>
    <AccordionContent>
      <slot />
    </AccordionContent>
  </AccordionItem>
</template>
