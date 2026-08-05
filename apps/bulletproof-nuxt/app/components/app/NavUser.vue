<script setup lang="ts">
import { ChevronsUpDown, LogOut, User2 } from "lucide-vue-next";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

defineProps<{
  collapsed?: boolean;
}>();

const emit = defineEmits<{
  profile: [];
  logout: [];
}>();

const { user } = useUser();
</script>

<template>
  <DropdownRoot>
    <DropdownTrigger as-child>
      <button
        type="button"
        :class="cn(
          'flex w-full items-center gap-2 overflow-hidden rounded-lg p-2 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
          collapsed ? 'size-10 justify-center' : 'h-12 justify-start',
        )"
      >
        <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <User2 class="size-4" />
        </span>
        <span
          v-if="!collapsed"
          class="grid min-w-0 flex-1 text-left text-sm leading-tight"
        >
          <span class="truncate font-semibold">
            {{ user ? `${user.firstName} ${user.lastName}` : "Account" }}
          </span>
          <span class="truncate text-xs text-muted-foreground">
            {{ user?.email ?? "Manage workspace" }}
          </span>
        </span>
        <ChevronsUpDown
          v-if="!collapsed"
          class="ml-auto size-4 shrink-0 text-muted-foreground"
        />
        <span class="sr-only">Open user menu</span>
      </button>
    </DropdownTrigger>
    <DropdownContent
      side="right"
      align="end"
      class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
    >
      <DropdownLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <User2 class="size-4" />
          </span>
          <span class="grid min-w-0 flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">
              {{ user ? `${user.firstName} ${user.lastName}` : "Account" }}
            </span>
            <span class="truncate text-xs text-muted-foreground">
              {{ user?.email ?? "Manage workspace" }}
            </span>
          </span>
        </div>
      </DropdownLabel>
      <DropdownSeparator />
      <DropdownItem
        class="gap-2"
        @click="emit('profile')"
      >
        <User2 class="size-4" />
        Your Profile
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem
        class="gap-2"
        @click="emit('logout')"
      >
        <LogOut class="size-4" />
        Sign Out
      </DropdownItem>
    </DropdownContent>
  </DropdownRoot>
</template>
