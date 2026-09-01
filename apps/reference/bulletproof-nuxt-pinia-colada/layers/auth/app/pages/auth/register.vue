<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuery } from "@pinia/colada";
import AppSpinner from "~~/app/components/app/AppSpinner.vue";
import { Button } from "~~/app/components/ui/button";
import { teamsQuery } from "~teams/app/queries/teams";
import { resolveLoginRedirect } from "#layers/auth/app/utils/loginRedirect";

definePageMeta({
  layout: "auth",
  title: "Register your account",
});

useHead({
  title: "Register your account",
});

const router = useRouter();
const route = useRoute();
const { data: teamsData, status, refresh } = useQuery(() => teamsQuery());

const teams = computed(() => teamsData.value);
const hasSettledTeams = computed(() => teams.value !== undefined);

const handleSuccess = () => {
  router.replace(resolveLoginRedirect(route.query.redirectTo));
};
</script>

<template>
  <AppSpinner
    v-if="status === 'pending' && !teams"
    label="Loading teams"
    class="flex min-h-48 items-center justify-center"
    size="lg"
  />
  <div
    v-else-if="status === 'error' && !teams"
    class="flex min-h-48 flex-col items-center justify-center gap-3 text-center"
    role="alert"
  >
    <p>Teams could not be loaded.</p>
    <Button
      variant="outline"
      @click="refresh()"
    >
      Retry
    </Button>
  </div>
  <RegisterForm
    v-else-if="hasSettledTeams"
    :teams="teams"
    @success="handleSuccess"
  />
</template>
