<script setup lang="ts">
import type { Component } from "vue";
import { inject } from "vue";
import { GalleryVerticalEnd } from "lucide-vue-next";
import { Sidebar } from "@/components/ui/sidebar";
import NavMain from "./NavMain.vue";
import NavUser from "./NavUser.vue";

type NavItem = {
  name: string;
  to: string;
  icon: Component;
  active?: boolean;
};

defineProps<{
  items: NavItem[];
}>();

const emit = defineEmits<{
  profile: [];
  logout: [];
}>();

const sidebar = inject<{ mobileOpen: { value: boolean }; setMobileOpen: (value: boolean) => void }>("sidebar");
</script>

<template>
  <Sidebar v-slot="{ collapsed }">
    <div class="flex h-14 items-center gap-2 border-b px-3">
      <NuxtLink
        to="/"
        class="flex min-w-0 items-center gap-2 font-semibold"
        aria-label="Bulletproof Nuxt home"
      >
        <div class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd class="size-4" />
        </div>
        <span
          v-if="!collapsed"
          class="truncate"
        >Bulletproof Nuxt</span>
      </NuxtLink>
    </div>

    <div class="flex flex-1 flex-col gap-4 py-3">
      <NavMain
        :items="items"
        :collapsed="collapsed"
      />
    </div>

    <div class="border-t p-2">
      <NavUser
        :collapsed="collapsed"
        @profile="emit('profile')"
        @logout="emit('logout')"
      />
    </div>
  </Sidebar>

  <Teleport to="body">
    <div
      v-if="sidebar?.mobileOpen.value"
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
    >
      <nav
        aria-label="Mobile navigation"
        class="fixed inset-y-0 left-0 flex w-72 flex-col border-r bg-sidebar p-3 text-sidebar-foreground shadow-lg"
      >
        <div class="mb-3 flex h-10 items-center gap-2 px-1 font-semibold">
          <div class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd class="size-4" />
          </div>
          <span>Bulletproof Nuxt</span>
        </div>
        <NuxtLink
          v-for="item in items"
          :key="item.name"
          :to="item.to"
          :aria-current="item.active ? 'page' : undefined"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          @click="sidebar?.setMobileOpen(false)"
        >
          <component
            :is="item.icon"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          {{ item.name }}
        </NuxtLink>
      </nav>
    </div>
  </Teleport>
</template>
