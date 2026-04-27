<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

import { AuthLayout } from '@/components/layouts'
import { paths } from '@/config/paths'
import { LoginForm } from '@/features/auth/components'

const router = useRouter()
const route = useRoute()
const redirectTo = route.query.redirectTo as string | undefined

const handleSuccess = () => {
  router.replace(redirectTo ? redirectTo : paths.app.dashboard.getHref())
}
</script>

<template>
  <AuthLayout title="Log in to your account">
    <LoginForm :on-success="handleSuccess" />
  </AuthLayout>
</template>
