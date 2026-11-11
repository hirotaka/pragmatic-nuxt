<script setup lang="ts">
defineProps<{ label?: string; icon?: string }>();
</script>

<template>
  <section class="my-4">
    <h3
      v-if="label"
      class="flex items-center gap-2 text-sm font-medium"
    >
      <Icon
        v-if="icon"
        :name="icon"
        class="size-4"
      />{{ label }}
    </h3><slot />
  </section>
</template>
