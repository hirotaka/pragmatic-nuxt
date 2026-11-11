<script setup lang="ts">
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const email = ref("");
const password = ref("");
const remember = ref(false);
const submitted = ref(false);

function onSubmit() {
  submitted.value = true;
}
</script>

<template>
  <form
    class="space-y-5"
    @submit.prevent="onSubmit"
  >
    <div class="text-center">
      <div class="mx-auto flex size-12 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary">
        <Icon
          name="i-lucide-lock"
          class="size-6"
        />
      </div>
      <h1 class="mt-4 text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p class="mt-2 text-sm/6 text-muted-foreground">
        Don't have an account?
        <NuxtLink
          to="/signup"
          class="text-primary font-medium"
        >Sign up</NuxtLink>.
      </p>
    </div>

    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        required
        type="email"
        autocomplete="email"
        placeholder="Enter your email"
      />
    </div>
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <Label for="password">Password</Label>
        <span class="text-sm text-muted-foreground">Auth UI only</span>
      </div>
      <Input
        id="password"
        v-model="password"
        required
        minlength="8"
        type="password"
        autocomplete="current-password"
        placeholder="Enter your password"
      />
    </div>
    <label class="flex items-center gap-2 text-sm text-muted-foreground">
      <input
        v-model="remember"
        type="checkbox"
        class="size-4 rounded border-input accent-primary"
      >
      <span>Remember me</span>
    </label>

    <Button
      type="submit"
      class="w-full"
    >
      Login
    </Button>
    <div class="grid gap-2">
      <Button
        type="button"
        variant="outline"
        class="w-full justify-center"
      >
        <Icon
          name="i-simple-icons-google"
          class="size-4"
        /> Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        class="w-full justify-center"
      >
        <Icon
          name="i-simple-icons-github"
          class="size-4"
        /> Continue with GitHub
      </Button>
    </div>
    <p
      v-if="submitted"
      class="text-center text-sm text-muted-foreground"
    >
      Submitted
    </p>
    <p class="text-center text-xs/5 text-muted-foreground">
      By signing in, you agree to our <NuxtLink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</NuxtLink>.
    </p>
  </form>
</template>
