<script setup lang="ts">
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
</script>

<template>
  <Collapsible
    default-open
    class="my-4 rounded-xl border p-4"
  >
    <CollapsibleTrigger class="font-medium">
      Details
    </CollapsibleTrigger>
    <CollapsibleContent>
      <slot />
    </CollapsibleContent>
  </Collapsible>
</template>
