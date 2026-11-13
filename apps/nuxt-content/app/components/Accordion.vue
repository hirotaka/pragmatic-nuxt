<script setup lang="ts">
import { Accordion } from "~/components/ui/accordion";
</script>

<template>
  <Accordion
    type="multiple"
    class="my-6 rounded-xl border px-4"
  >
    <slot />
  </Accordion>
</template>
