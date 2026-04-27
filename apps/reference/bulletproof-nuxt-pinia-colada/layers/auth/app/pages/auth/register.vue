<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import type { Team } from "~auth/shared/types";
import { useQuery } from "@pinia/colada";

definePageMeta({
  layout: "auth",
  title: "Register your account",
});

useHead({
  title: "Register your account",
});

const { $api } = useNuxtApp();
const router = useRouter();
const route = useRoute();
const redirectTo = route.query.redirectTo as string | undefined;

// Fetch teams
const { data: teamsData } = useQuery({
  key: () => ["teams"],
  query: () => $api<Team[]>("/api/teams"),
});

const handleSuccess = () => {
  router.replace(redirectTo ?? "/app");
};

const teams = computed(() => teamsData.value ?? []);
</script>

<template>
  <RegisterForm
    :teams="teams"
    @success="handleSuccess"
  />
</template>
