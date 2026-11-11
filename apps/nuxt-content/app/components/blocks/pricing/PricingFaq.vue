<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";

interface FaqItem {
  label: string;
  content: string;
}

defineProps<{
  title: string;
  description: string;
  items: FaqItem[];
}>();
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-semibold tracking-tight md:text-4xl">
          {{ title }}
        </h2>
        <p class="text-muted-foreground mt-4">
          {{ description }}
        </p>
      </div>
      <Accordion
        type="single"
        collapsible
        default-value="0"
        class="border-grid mx-auto mt-10 max-w-3xl rounded-2xl border bg-card/70 px-5"
      >
        <AccordionItem
          v-for="(item, index) in items"
          :key="item.label"
          :value="String(index)"
        >
          <AccordionTrigger class="text-base font-medium">
            {{ item.label }}
          </AccordionTrigger>
          <AccordionContent class="text-base/7 text-muted-foreground">
            {{ item.content }}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
</template>
