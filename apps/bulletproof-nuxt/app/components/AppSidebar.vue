<script setup lang="ts">
import type { Component } from "vue";
import { computed } from "vue";
import { GalleryVerticalEnd } from "@lucide/vue";
import { useSidebar } from "@/components/ui/sidebar";

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

const { isMobile, state, setOpenMobile } = useSidebar();
const collapsed = computed(() => !isMobile.value && state.value === "collapsed");

const handleNavigationClick = (event: MouseEvent) => {
  if (isMobile.value && (event.target as Element).closest("a")) {
    setOpenMobile(false);
  }
};
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader class="h-14 justify-center border-b px-3">
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
    </SidebarHeader>

    <SidebarContent class="py-3">
      <NavMain
        :items="items"
        :collapsed="collapsed"
        @click="handleNavigationClick"
      />
    </SidebarContent>

    <SidebarFooter class="border-t p-2">
      <NavUser
        :collapsed="collapsed"
        @profile="emit('profile')"
        @logout="emit('logout')"
      />
    </SidebarFooter>
  </Sidebar>
</template>
