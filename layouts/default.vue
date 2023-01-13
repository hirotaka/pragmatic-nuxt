<script setup lang="ts">
import { ref } from 'vue'
import { Bars3BottomLeftIcon } from '@heroicons/vue/24/outline'

const sidebarOpen = ref(false)
const setSidebarOpen = (value) => (sidebarOpen.value = value)
</script>

<template>
  <AppProvider>
    <div
      v-if="isAuthenticated"
      class="h-screen flex overflow-hidden bg-gray-100"
    >
      <MenuMobileSidebar
        :sidebar-open="sidebarOpen"
        :set-sidebar-open="setSidebarOpen"
      />
      <MenuSidebar />
      <div class="flex flex-col w-0 flex-1 overflow-hidden">
        <div class="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            class="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            @click="setSidebarOpen(true)"
          >
            <span class="sr-only">Open sidebar</span>
            <Bars3BottomLeftIcon class="h-6 w-6" aria-hidden="true" />
          </button>
          <div class="flex-1 px-4 flex justify-end">
            <div class="ml-4 flex items-center md:ml-6">
              <MenuUserNavigation />
            </div>
          </div>
        </div>
        <main class="flex-1 relative overflow-y-auto focus:outline-none">
          <slot />
        </main>
      </div>
    </div>
  </AppProvider>
</template>
