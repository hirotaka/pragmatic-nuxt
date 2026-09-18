<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { teamsQuery } from "#layers/teams/app/queries/teams";
import { Button } from "~~/app/components/ui/button";
import { Spinner } from "~~/app/components/ui/spinner";

definePageMeta({
  layout: "auth",
  title: "Register your account",
});

useHead({
  title: "Register your account",
});

const router = useRouter();
const route = useRoute();
const redirectTo = route.query.redirectTo as string | undefined;

const { data: teamsData, refetch, status, suspense } = useQuery(teamsQuery());
await suspense().catch(() => undefined);
const hasSettledTeams = computed(() => teamsData.value !== undefined);

const retryTeams = () => {
  void refetch({ throwOnError: true }).catch(() => undefined);
};

const handleSuccess = () => {
  router.replace(redirectTo ?? "/app");
};
</script>

<template>
  <div
    v-if="status === 'pending' && !teamsData"
    class="flex min-h-48 items-center justify-center"
    role="status"
  >
    <Spinner size="lg" />
    <span class="sr-only">Loading teams</span>
  </div>
  <div
    v-else-if="status === 'error' && !teamsData"
    class="flex min-h-48 flex-col items-center justify-center gap-3 text-center"
    role="alert"
  >
    <p>Teams could not be loaded.</p>
    <Button
      variant="outline"
      @click="retryTeams"
    >
      Retry
    </Button>
  </div>
  <RegisterForm
    v-else-if="hasSettledTeams"
    :teams="teamsData"
    @success="handleSuccess"
  />
</template>
