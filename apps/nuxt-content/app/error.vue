<script setup lang="ts">
import type { NuxtError } from "#app";
import { Button } from "~/components/ui/button";

defineProps<{ error: NuxtError }>();

useHead({ htmlAttrs: { lang: "en" } });
useSeoMeta({ title: "Page not found", description: "We are sorry but this page could not be found." });

const links = [
  { label: "Docs", icon: "i-lucide-book", to: "/docs/getting-started" },
  { label: "Pricing", icon: "i-lucide-credit-card", to: "/pricing" },
  { label: "Blog", icon: "i-lucide-pencil", to: "/blog" },
];
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader />
    <main class="border-grid border-y">
      <div class="container flex min-h-[60vh] items-center justify-center py-20 text-center">
        <div>
          <p class="text-primary text-sm font-medium">
            {{ error.statusCode }}
          </p>
          <h1 class="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            {{ error.statusMessage || 'Page not found' }}
          </h1>
          <p class="text-muted-foreground mx-auto mt-4 max-w-md">
            We are sorry but this page could not be found.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              v-for="link in links"
              :key="link.to"
              as="a"
              :href="link.to"
              variant="outline"
            >
              <Icon
                :name="link.icon"
                class="size-4"
              />
              {{ link.label }}
            </Button>
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>
