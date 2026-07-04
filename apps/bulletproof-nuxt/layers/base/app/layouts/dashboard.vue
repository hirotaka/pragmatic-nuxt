<script setup lang="ts">
import { Folder, Home, Users } from "lucide-vue-next";
import { computed, type Component } from "vue";
import AppSidebar from "~~/components/app/AppSidebar.vue";
import SiteHeader from "~~/components/app/SiteHeader.vue";
import { SidebarInset, SidebarProvider } from "~~/components/ui/sidebar";
import { useLogout } from "#layers/auth/app/composables/useLogout";
import { ROLES } from "#layers/auth/app/composables/useAuthorization";

type SideNavigationItem = {
  name: string;
  to: string;
  icon: Component;
  end?: boolean;
  active?: boolean;
};

const router = useRouter();
const route = useRoute();
const { checkAccess } = useAuthorization();
const logout = useLogout();

const isActive = (item: SideNavigationItem) => {
  const currentPath = route.path;
  if (item.end) {
    return currentPath === item.to;
  }
  return currentPath.startsWith(item.to);
};

const navigation = computed<SideNavigationItem[]>(() => {
  const items = [
    { name: "Dashboard", to: "/app", icon: Home, end: true },
    { name: "Discussions", to: "/app/discussions", icon: Folder },
    checkAccess({ allowedRoles: [ROLES.ADMIN] }) && {
      name: "Users",
      to: "/app/users",
      icon: Users,
      end: true,
    },
  ].filter(Boolean) as SideNavigationItem[];

  return items.map(item => ({
    ...item,
    active: isActive(item),
  }));
});

const handleLogout = async () => {
  const currentPath = route.fullPath;
  await logout.mutate();
  await router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`);
};

const handleProfileClick = () => {
  router.push("/app/profile");
};
</script>

<template>
  <SidebarProvider>
    <AppSidebar
      :items="navigation"
      @profile="handleProfileClick"
      @logout="handleLogout"
    />
    <SidebarInset>
      <SiteHeader />
      <div class="flex flex-1 flex-col">
        <div class="@container/main flex flex-1 flex-col gap-2">
          <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            <slot />
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
