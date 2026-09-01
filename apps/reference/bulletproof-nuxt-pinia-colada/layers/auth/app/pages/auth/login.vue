<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { resolveLoginRedirect } from "#layers/auth/app/utils/loginRedirect";

definePageMeta({
  layout: "auth",
  title: "Log in to your account",
});

useHead({
  title: "Log in to your account",
});

const router = useRouter();
const route = useRoute();
const handleSuccess = () => {
  router.replace(resolveLoginRedirect(route.query.redirectTo));
};
</script>

<template>
  <LoginForm @success="handleSuccess" />
</template>
