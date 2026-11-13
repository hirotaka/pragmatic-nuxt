<script setup lang="ts">
interface FeatureItem {
  title?: string;
  name?: string;
  description: string;
  icon: string;
}

interface SectionItem {
  id?: string;
  title: string;
  description: string;
  reverse?: boolean;
  features: FeatureItem[];
}

defineProps<{ sections: SectionItem[] }>();
</script>

<template>
  <section
    v-for="section in sections"
    :id="section.id"
    :key="section.title"
    class="border-grid border-b py-16 md:py-24"
  >
    <div
      class="container grid items-center gap-10 lg:grid-cols-2"
      :class="section.reverse ? 'lg:[&>*:first-child]:order-2' : ''"
    >
      <div>
        <h2 class="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          {{ section.title }}
        </h2>
        <p class="text-muted-foreground mt-4 max-w-xl text-pretty">
          {{ section.description }}
        </p>
        <dl class="mt-8 grid gap-5">
          <div
            v-for="feature in section.features"
            :key="feature.name || feature.title"
            class="rounded-xl p-2 -m-2 flex gap-4"
          >
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
              <Icon
                :name="feature.icon"
                class="size-5"
              />
            </div>
            <div>
              <dt class="font-medium">
                {{ feature.name || feature.title }}
              </dt>
              <dd class="mt-1 text-sm/6 text-muted-foreground">
                {{ feature.description }}
              </dd>
            </div>
          </div>
        </dl>
      </div>
      <ImagePlaceholder />
    </div>
  </section>
</template>
