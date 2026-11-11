<script setup lang="ts">
import { Tabs, TabsContent } from "~/components/ui/tabs";
</script>

<template>
  <Tabs
    default-value="content"
    class="border-grid my-6 rounded-xl border p-4"
  >
    <TabsContent value="content">
      <slot />
    </TabsContent>
  </Tabs>
</template>
