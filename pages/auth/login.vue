<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const onSuccess = () => {
  router.push({ path: '/main' })
}

definePageMeta({
  layout: 'auth',
  title: 'Log in to your account'
})
</script>

<template>
  <div>
    <FeatureAuthLogin @success="onSuccess" />
    <div class="mt-2 flex items-center justify-end">
      <div class="text-sm">
        <RouterLink
          to="/auth/register"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Register
        </RouterLink>
      </div>
    </div>
  </div>
</template>
