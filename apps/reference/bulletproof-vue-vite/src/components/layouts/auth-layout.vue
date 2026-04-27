<script setup lang="ts">
import logo from '@/assets/logo.svg'
import { Link } from '@/components/ui/link'
import { paths } from '@/config/paths'

type Props = {
  title: string
}

defineProps<Props>()
</script>

<template>
  <main class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <Link class="flex items-center text-white" :to="paths.home.getHref()">
          <img class="h-24 w-auto p-3" :src="logo" alt="Workflow" />
        </Link>
      </div>

      <h2 class="mt-3 text-center text-3xl font-extrabold text-gray-900">
        {{ title }}
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <slot></slot>
      </div>
    </div>
  </main>
</template>
