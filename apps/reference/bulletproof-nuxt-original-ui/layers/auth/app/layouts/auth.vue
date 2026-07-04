<script setup lang="ts">
const route = useRoute();
const title = computed(() => (route.meta.title as string) || "Log in to your account");
</script>

<template>
  <main class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <NuxtLink
          class="flex items-center text-white"
          to="/"
        >
          <img
            class="h-24 w-auto p-3"
            :src="'/logo.svg'"
            alt="Bulletproof Nuxt"
          >
        </NuxtLink>
      </div>
      <h2 class="mt-3 text-center text-3xl font-extrabold text-gray-900">
        {{ title }}
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <slot />
      </div>
    </div>
  </main>
</template>
