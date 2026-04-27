<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { AuthLayout } from '@/components/layouts'
import { paths } from '@/config/paths'
import { RegisterForm } from '@/features/auth/components'
import { useTeams } from '@/features/teams/api/get-teams'

const router = useRouter()
const route = useRoute()
const redirectTo = route.query.redirectTo as string | undefined
const chooseTeam = ref(false)

const teamsQuery = useTeams({
  queryConfig: {
    enabled: chooseTeam,
  },
})

const handleSuccess = () => {
  router.replace(redirectTo ? redirectTo : paths.app.dashboard.getHref())
}

const toggleChooseTeam = () => {
  chooseTeam.value = !chooseTeam.value
}

const teams = computed(() => teamsQuery.data.value?.data)
</script>

<template>
  <AuthLayout title="Register your account">
    <RegisterForm
      :on-success="handleSuccess"
      :choose-team="chooseTeam"
      :set-choose-team="toggleChooseTeam"
      :teams="teams"
    />
  </AuthLayout>
</template>
