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
  <Card>
    <CardHeader class="text-center">
      <CardTitle class="text-xl">
        Welcome back
      </CardTitle>
      <CardDescription>
        Log in to continue managing your team's discussions.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <LoginForm @success="handleSuccess" />
      <div class="mt-4 text-center text-sm">
        Don&apos;t have an account?
        <NuxtLink
          to="/auth/register"
          class="font-medium underline underline-offset-4"
        >
          Register
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
