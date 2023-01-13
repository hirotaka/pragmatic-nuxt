<script setup lang="ts">
import { useRouter, RouterLink } from "vue-router";

const router = useRouter();

const onSuccess = () => {
  router.push({ path: "/main" });
};

definePageMeta({
  layout: "auth",
  title: "Register your account",
});
</script>

<template>
  <div>
    <FeatureAuthRegister @success="onSuccess" />
    <div class="mt-2 flex items-center justify-end">
      <div class="text-sm">
        <RouterLink
          to="/auth/login"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Log In
        </RouterLink>
      </div>
    </div>
  </div>
</template>
