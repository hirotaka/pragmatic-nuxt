<script setup lang="ts">
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const columns = [
  { label: "Resources", children: [{ label: "Docs", to: "/docs/getting-started" }, { label: "Roadmap", to: "/changelog" }, { label: "Changelog", to: "/changelog" }] },
  { label: "Features", children: [{ label: "Components", to: "https://ui.stackhacker.io" }, { label: "Templates", to: "https://ui.stackhacker.io/templates" }, { label: "Sponsors", to: "https://github.com/stackhacker-ui" }] },
  { label: "Company", children: [{ label: "About", to: "https://ui.stackhacker.io" }, { label: "Pricing", to: "/pricing" }, { label: "Blog", to: "/blog" }] },
];

const email = ref("");
const subscribed = ref(false);

function onSubmit() {
  subscribed.value = true;
}
</script>

<template>
  <footer class="border-grid border-t">
    <div class="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(18rem,1.25fr)]">
      <div class="grid gap-8 sm:grid-cols-3 md:col-span-2 lg:col-span-3">
        <div
          v-for="column in columns"
          :key="column.label"
          class="space-y-3"
        >
          <h2 class="text-sm font-semibold">
            {{ column.label }}
          </h2>
          <ul class="space-y-2.5">
            <li
              v-for="child in column.children"
              :key="child.label"
            >
              <NuxtLink
                :to="child.to"
                class="text-sm text-muted-foreground hover:text-foreground"
              >
                {{ child.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <form
        class="max-w-sm space-y-3 lg:ml-auto lg:w-full"
        @submit.prevent="onSubmit"
      >
        <div class="space-y-1.5">
          <Label
            for="newsletter"
            class="text-sm"
          >Subscribe to our newsletter</Label>
          <p class="text-sm/6 text-muted-foreground">
            Product updates and template notes, no spam.
          </p>
        </div>
        <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] md:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            id="newsletter"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="min-w-0"
          />
          <Button
            type="submit"
            size="sm"
          >
            Subscribe
          </Button>
        </div>
        <p
          v-if="subscribed"
          class="text-sm text-muted-foreground"
        >
          Subscribed!
        </p>
      </form>
    </div>

    <div class="border-grid border-t">
      <div class="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        <div class="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <AppLogo class="h-5 w-auto" />
          <p class="text-center text-sm text-muted-foreground sm:text-left">
            Built with Stackhacker UI • © {{ new Date().getFullYear() }}
          </p>
        </div>
        <div class="flex items-center gap-1">
          <Button
            as="a"
            href="https://github.com/stackhacker-ui"
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="icon"
            aria-label="Stackhacker UI on GitHub"
          >
            <Icon
              name="i-simple-icons-github"
              class="text-xl"
            />
          </Button>
          <Button
            as="a"
            href="https://ui.stackhacker.io"
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="icon"
            aria-label="Stackhacker UI website"
          >
            <Icon
              name="i-lucide-globe"
              class="text-xl"
            />
          </Button>
        </div>
      </div>
    </div>
  </footer>
</template>
