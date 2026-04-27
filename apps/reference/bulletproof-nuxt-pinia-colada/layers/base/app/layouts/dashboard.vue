<script setup lang="ts">
import { Home, PanelLeft, Folder, Users, User2 } from "lucide-vue-next";
import { computed, ref, onMounted, type Component } from "vue";
import { cn } from "~base/app/utils/cn";
import { useLogout } from "#layers/auth/app/composables/useLogout";
import { ROLES } from "#layers/auth/app/composables/useAuthorization";

type SideNavigationItem = {
  name: string;
  to: string;
  icon: Component;
  end?: boolean;
};

const router = useRouter();
const route = useRoute();
const { checkAccess } = useAuthorization();
const logout = useLogout({
  onSuccess: () => {
    router.push(`/auth/login?redirectTo=${encodeURIComponent(route.fullPath)}`);
  },
});

// Progress indicator for route loading
const progress = ref(0);
const isLoading = ref(false);

onMounted(() => {
  router.beforeEach(() => {
    isLoading.value = true;
    progress.value = 0;

    const interval = setInterval(() => {
      if (progress.value >= 100) {
        clearInterval(interval);
      }
      else {
        progress.value += 10;
      }
    }, 300);

    // Clear after navigation completes
    setTimeout(() => {
      isLoading.value = false;
      clearInterval(interval);
    }, 1000);
  });
});

const navigation = computed<SideNavigationItem[]>(() => {
  return [
    { name: "Dashboard", to: "/app", icon: Home, end: true },
    { name: "Discussions", to: "/app/discussions", icon: Folder, end: false },
    checkAccess({ allowedRoles: [ROLES.ADMIN] }) && {
      name: "Users",
      to: "/app/users",
      icon: Users,
      end: true,
    },
  ].filter(Boolean) as SideNavigationItem[];
});

const isActive = (item: SideNavigationItem) => {
  const currentPath = route.path;
  if (item.end) {
    return currentPath === item.to;
  }
  return currentPath.startsWith(item.to);
};

const handleLogout = () => {
  logout.mutate();
};

const handleProfileClick = () => {
  router.push("/app/profile");
};

const mobileMenuOpen = ref(false);
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-muted/40">
    <!-- Desktop Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-black sm:flex">
      <nav class="flex flex-col items-center gap-4 px-2 py-4">
        <div class="flex h-16 shrink-0 items-center px-4">
          <ULink
            class="flex items-center text-white"
            to="/"
          >
            <img
              class="h-8 w-auto p-1.5"
              :src="'/logo.svg'"
              alt="Workflow"
            >
            <span class="text-sm font-semibold text-white">Bulletproof Nuxt</span>
          </ULink>
        </div>
        <template
          v-for="item in navigation"
          :key="item.name"
        >
          <ULink
            :to="item.to"
            :class="
              cn(
                'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex w-full flex-1 items-center rounded-md p-2 text-base font-medium',
                isActive(item) && 'bg-gray-900 text-white',
              )
            "
          >
            <component
              :is="item.icon"
              :class="cn('text-gray-400 group-hover:text-gray-300', 'mr-4 size-6 shrink-0')"
              aria-hidden="true"
            />
            {{ item.name }}
          </ULink>
        </template>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-60">
      <!-- Header -->
      <header
        class="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:justify-end sm:border-0 sm:bg-transparent sm:px-6"
      >
        <div
          v-if="isLoading"
          class="fixed left-0 top-0 h-1 bg-blue-500 transition-all duration-200 ease-in-out"
          :style="{ width: `${progress}%` }"
        />

        <!-- Mobile Menu Trigger -->
        <ClientOnly>
          <UDrawerRoot v-model:open="mobileMenuOpen">
            <UDrawerTrigger>
              <UButton
                size="icon"
                variant="outline"
                class="sm:hidden"
              >
                <PanelLeft class="size-5" />
                <span class="sr-only">Toggle Menu</span>
              </UButton>
            </UDrawerTrigger>
            <UDrawerContent
              side="left"
              class="bg-black pt-10 text-white sm:max-w-60"
            >
              <nav class="grid gap-6 text-lg font-medium">
                <div class="flex h-16 shrink-0 items-center px-4">
                  <ULink
                    class="flex items-center text-white"
                    to="/"
                    @click="mobileMenuOpen = false"
                  >
                    <img
                      class="h-8 w-auto"
                      :src="'/logo.svg'"
                      alt="Workflow"
                    >
                    <span class="text-sm font-semibold text-white">Bulletproof Nuxt</span>
                  </ULink>
                </div>
                <template
                  v-for="item in navigation"
                  :key="item.name"
                >
                  <ULink
                    :to="item.to"
                    :class="
                      cn(
                        'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'group flex w-full flex-1 items-center rounded-md p-2 text-base font-medium',
                        isActive(item) && 'bg-gray-900 text-white',
                      )
                    "
                    @click="mobileMenuOpen = false"
                  >
                    <component
                      :is="item.icon"
                      :class="cn('text-gray-400 group-hover:text-gray-300', 'mr-4 size-6 shrink-0')"
                      aria-hidden="true"
                    />
                    {{ item.name }}
                  </ULink>
                </template>
              </nav>
            </UDrawerContent>
          </UDrawerRoot>
        </ClientOnly>

        <!-- User Menu -->
        <ClientOnly>
          <UDropdownRoot>
            <UDropdownTrigger as-child>
              <UButton
                variant="outline"
                size="icon"
                class="overflow-hidden rounded-full"
              >
                <span class="sr-only">Open user menu</span>
                <User2 class="size-6 rounded-full" />
              </UButton>
            </UDropdownTrigger>
            <UDropdownContent align="end">
              <UDropdownItem
                :class="cn('block px-4 py-2 text-sm text-gray-700')"
                @click="handleProfileClick"
              >
                Your Profile
              </UDropdownItem>
              <UDropdownSeparator />
              <UDropdownItem
                :class="cn('block w-full px-4 py-2 text-sm text-gray-700')"
                @click="handleLogout"
              >
                Sign Out
              </UDropdownItem>
            </UDropdownContent>
          </UDropdownRoot>
        </ClientOnly>
      </header>

      <!-- Main Content -->
      <main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <slot />
      </main>
    </div>
  </div>
</template>
