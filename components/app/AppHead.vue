<script setup lang="ts">
import { Head } from "@vueuse/head";

type AppHeadProps = {
  title?: string;
  description?: string;
};

defineProps<AppHeadProps>();

const defaultTitle = "Bulletproof Nuxt";
</script>

<template>
  <Head>
    <title>{{ title ? `${title} | ${defaultTitle}` : defaultTitle }}</title>
    <meta name="description" :content="description" />
  </Head>
</template>
