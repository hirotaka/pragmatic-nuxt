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
  <Card>
    <CardHeader class="px-5 py-4 text-center">
      <div class="flex justify-center">
        <Badge variant="secondary">
          Demo workspace
        </Badge>
      </div>
      <CardTitle class="text-xl">
        Create your account
      </CardTitle>
      <CardDescription>
        Start a new team or join an existing one. Demo data is periodically cleared.
      </CardDescription>
    </CardHeader>
    <CardContent class="px-5 pb-4">
      <RegisterForm
        :teams="teamsData"
        @success="handleSuccess"
      />
      <div class="mt-4 text-center text-sm">
        Already have an account?
        <NuxtLink
          :to="`/auth/login${redirectTo ? `?redirectTo=${redirectTo}` : ''}`"
          class="font-medium underline underline-offset-4"
        >
          Log in
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
