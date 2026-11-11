<script setup lang="ts">
const { data: page } = await useAsyncData("pricing", () => queryCollection("pricing").first());
const isYearly = ref(false);

const title = computed(() => page.value?.seo?.title || page.value?.title || "Pricing");
const description = computed(() => page.value?.seo?.description || page.value?.description || "Choose the plan that's right for you.");

useSeoMeta({ title, ogTitle: title, description, ogDescription: description });
</script>

<template>
  <div v-if="page">
    <PricingHero
      v-model:yearly="isYearly"
      :title="page.title"
      :description="page.description"
    />
    <PricingPlans
      :plans="page.plans"
      :yearly="isYearly"
    />
    <PricingLogoCloud
      :title="page.logos.title"
      :icons="page.logos.icons"
    />
    <PricingFaq
      :title="page.faq.title"
      :description="page.faq.description"
      :items="page.faq.items"
    />
  </div>
</template>
