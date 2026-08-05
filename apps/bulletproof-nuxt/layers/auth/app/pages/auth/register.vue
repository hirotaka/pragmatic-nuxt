<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { useTeams } from "#layers/teams/app/composables/useTeams";

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

const { data: teamsData } = await useTeams();

const handleSuccess = () => {
  router.replace(redirectTo ?? "/app");
};
</script>

<template>
  <RegisterForm
    :teams="teamsData"
    @success="handleSuccess"
  />
</template>
