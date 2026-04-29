<script setup lang="ts">
export type HeadProps = {
  title?: string;
  description?: string;
};

const props = withDefaults(defineProps<HeadProps>(), {
  title: "",
  description: "",
});

useHead({
  title: props.title ? `${props.title} | Bulletproof Nuxt` : "Bulletproof Nuxt",
  meta: [
    {
      name: "description",
      content: props.description,
    },
  ],
});
</script>

<template>
  <div style="display: none" />
</template>
