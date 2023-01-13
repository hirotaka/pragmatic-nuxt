<script setup lang="ts">
type EntryProps = {
  label: string;
  value: string;
};

defineProps<EntryProps>();
</script>

<template>
  <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
    <dt class="text-sm font-medium text-gray-500">{{ label }}</dt>
    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
      {{ value }}
    </dd>
  </div>
</template>
