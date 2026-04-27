<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";

definePageMeta({
  layout: "auth",
  title: "Log in to your account",
});

useHead({
  title: "Log in to your account",
});

const router = useRouter();
const route = useRoute();
const redirectTo = route.query.redirectTo as string | undefined;

const handleSuccess = () => {
  router.replace(redirectTo || "/app");
};
</script>

<template>
  <LoginForm @success="handleSuccess" />
</template>
