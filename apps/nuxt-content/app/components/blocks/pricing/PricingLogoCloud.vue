<script setup lang="ts">
defineProps<{
  title: string;
  icons: string[];
}>();
</script>

<template>
  <section class="border-grid border-y bg-muted/10 py-12">
    <div class="container text-center">
      <p class="text-muted-foreground text-sm font-medium">
        {{ title }}
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-10">
        <Icon
          v-for="icon in icons"
          :key="icon"
          :name="icon"
          class="text-4xl text-muted-foreground/80 md:text-5xl"
        />
      </div>
    </div>
  </section>
</template>
