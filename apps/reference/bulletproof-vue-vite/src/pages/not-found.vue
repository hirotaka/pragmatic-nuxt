<script setup lang="ts">
import { useRouter } from 'vue-router'

import { Head } from '@/components/seo'
import { Button } from '@/components/ui/button'

const router = useRouter()
</script>

<template>
  <Head title="Page Not Found" description="The page you're looking for doesn't exist" />
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-900">404</h1>
      <h2 class="mt-4 text-3xl font-semibold text-gray-700">Page Not Found</h2>
      <p class="mt-2 text-lg text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
      <div class="mt-8 flex justify-center gap-4">
        <Button @click="router.push('/')"> Go to Home </Button>
        <Button variant="outline" @click="router.back()"> Go Back </Button>
      </div>
    </div>
  </div>
</template>
