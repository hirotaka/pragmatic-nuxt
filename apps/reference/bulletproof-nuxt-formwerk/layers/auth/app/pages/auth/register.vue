<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { Team } from "~auth/shared/types";

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

// Fetch teams
const { data: teamsData } = await useFetch<Team[]>("/api/teams");

const handleSuccess = () => {
  router.replace(redirectTo ? redirectTo : "/app");
};

const teams = computed(() => teamsData.value);
</script>

<template>
  <RegisterForm
    :teams="teams"
    @success="handleSuccess"
  />
</template>
