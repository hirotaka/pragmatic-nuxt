<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import { FolderIcon, HomeIcon, UsersIcon } from "@heroicons/vue/24/outline";

type SideNavigationItem = {
  name: string;
  to: string;
};

const { checkAccess } = useAuthorization();

const navigation = [
  { name: "Dashboard", to: { path: "/main" }, icon: HomeIcon },
  { name: "Discussions", to: { path: "/main/discussions" }, icon: FolderIcon },
  checkAccess({ allowedRoles: [ROLES.ADMIN] }) && {
    name: "Users",
    to: { path: "/main/users" },
    icon: UsersIcon,
  },
].filter(Boolean) as SideNavigationItem[];

const currentRoute = useRoute();

const isActive = (route) => {
  return route.path === "/main"
    ? currentRoute.path === route.path
    : currentRoute.path.startsWith(route.path);
};

interface Emits {
  (e: "click"): void;
}

const emit = defineEmits<Emits>();

const handleClick = () => {
  emit("click");
};
</script>

<template>
  <ul>
    <li v-for="item in navigation" :key="item.name">
      <RouterLink v-slot="{ route }" :to="item.to" @click.native="handleClick">
        <span
          class="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-base font-medium rounded-md"
          :class="isActive(route) && 'bg-gray-900 text-white'"
        >
          <component
            :is="item.icon"
            class="text-gray-400 group-hover:text-gray-300 mr-4 flex-shrink-0 h-6 w-6"
            aria-hidden="true"
          />
          {{ item.name }}
        </span>
      </RouterLink>
    </li>
  </ul>
</template>
