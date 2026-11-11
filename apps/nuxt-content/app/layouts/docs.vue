<script setup lang="ts">
import type { Ref } from "vue";

interface NavItem {
  title?: string;
  path?: string;
  children?: NavItem[];
}

const navigation = inject<Ref<NavItem[] | null>>("navigation", ref([]));
</script>

<template>
  <div>
    <AppHeader />
    <main class="border-grid border-y">
      <div class="container grid gap-10 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside class="hidden lg:block">
          <div class="sticky top-20 space-y-6">
            <ClientOnly>
              <DocsSearch />
            </ClientOnly>
            <nav class="space-y-4 text-sm">
              <div
                v-for="group in navigation || []"
                :key="group.path || group.title"
                class="space-y-2"
              >
                <NuxtLink
                  v-if="group.path"
                  :to="group.path"
                  class="font-medium hover:text-primary"
                >
                  {{ group.title }}
                </NuxtLink>
                <p
                  v-else
                  class="font-medium"
                >
                  {{ group.title }}
                </p>
                <div
                  v-if="group.children?.length"
                  class="border-grid ml-3 space-y-1 border-l pl-3"
                >
                  <NuxtLink
                    v-for="child in group.children"
                    :key="child.path || child.title"
                    :to="child.path || '#'"
                    class="text-muted-foreground hover:text-foreground block py-1 transition-colors"
                  >
                    {{ child.title }}
                  </NuxtLink>
                </div>
              </div>
            </nav>
          </div>
        </aside>
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>
