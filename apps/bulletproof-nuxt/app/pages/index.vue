<script setup lang="ts">
import { Home } from "@lucide/vue";

definePageMeta({ layout: false });

useSeoMeta({ description: "Welcome to bulletproof nuxt" });

const router = useRouter();
const { user } = useUser();

const handleStart = () => {
  if (user.value) {
    router.push("/app");
  }
  else {
    router.push("/auth/login");
  }
};
</script>

<template>
  <div class="min-h-svh bg-muted">
    <div class="mx-auto flex min-h-svh max-w-5xl items-center px-6 py-12 md:px-10">
      <Card class="w-full overflow-hidden">
        <CardContent class="grid gap-0 p-0 md:grid-cols-[1fr_0.8fr]">
          <div class="flex flex-col justify-center gap-8 p-8 md:p-12">
            <div class="flex flex-col gap-4">
              <Badge
                variant="secondary"
                class="w-fit"
              >
                Practical Nuxt application
              </Badge>
              <div class="flex flex-col gap-3">
                <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
                  Bulletproof Nuxt
                </h1>
                <p class="max-w-xl text-base text-muted-foreground md:text-lg">
                  A practical minimum business app showcasing authentication, CRUD,
                  permissions, forms, database access, and tests in Nuxt.
                </p>
              </div>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row">
              <Button @click="handleStart">
                <Home
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                Get started
              </Button>
              <a
                href="https://github.com/hirotaka/bulletproof-vue"
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="outline"
                  class="w-full sm:w-auto"
                >
                  <Icon
                    name="uil:github"
                    mode="svg"
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                  Github Repo
                </Button>
              </a>
            </div>
          </div>
          <div class="hidden items-center justify-center border-l bg-muted/40 p-10 md:flex">
            <img
              :src="'/logo.svg'"
              alt="nuxt"
              class="h-48 rounded-2xl bg-background p-8 shadow-sm"
            >
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
