<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";

withDefaults(defineProps<{ label?: string }>(), { label: "Code" });
</script>

<template>
  <Collapsible
    default-open
    class="code-surface group border-grid my-6 overflow-hidden rounded-lg border bg-muted/20 text-card-foreground"
  >
    <CollapsibleTrigger class="border-grid flex min-h-9 w-full items-center justify-between border-b bg-background/80 px-3 py-1.5 text-left font-mono text-xs font-medium text-muted-foreground hover:text-foreground">
      {{ label }}
      <ChevronDown class="size-4 transition-transform group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
    <CollapsibleContent class="[&_.code-surface]:my-0 [&_.code-surface]:rounded-none [&_.code-surface]:border-0 [&_.code-surface>div:first-child]:bg-transparent [&_>_:first-child]:mt-0 [&_>_:last-child]:mb-0">
      <slot />
    </CollapsibleContent>
  </Collapsible>
</template>
