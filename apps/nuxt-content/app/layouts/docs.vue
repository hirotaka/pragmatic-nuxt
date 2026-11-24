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
      <div class="container grid gap-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside>
          <div class="flex flex-col gap-6 lg:sticky lg:top-20">
            <ClientOnly>
              <DocsSearch />
              <template #fallback>
                <div
                  aria-hidden="true"
                  class="h-9 pointer-coarse:h-11"
                />
              </template>
            </ClientOnly>
            <nav class="hidden space-y-4 text-sm lg:block">
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
