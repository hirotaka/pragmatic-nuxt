<script setup lang="ts">
import { computed } from "vue";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const route = useRoute();

const currentPage = computed(() => {
  if (route.path === "/app") return "Dashboard";
  if (route.path.startsWith("/app/discussions/")) return "Discussion";
  if (route.path.startsWith("/app/discussions")) return "Discussions";
  if (route.path.startsWith("/app/users")) return "Users";
  if (route.path.startsWith("/app/profile")) return "Profile";
  return "Application";
});
</script>

<template>
  <header class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <SidebarTrigger class="-ml-1" />
    <Separator
      orientation="vertical"
      class="mr-2 h-4"
    />
    <nav
      aria-label="Breadcrumb"
      class="flex items-center gap-2 text-sm"
    >
      <NuxtLink
        to="/app"
        class="hidden text-muted-foreground transition-colors hover:text-foreground md:inline"
      >
        App
      </NuxtLink>
      <span class="hidden text-muted-foreground md:inline">/</span>
      <span class="font-medium">{{ currentPage }}</span>
    </nav>
  </header>
</template>
