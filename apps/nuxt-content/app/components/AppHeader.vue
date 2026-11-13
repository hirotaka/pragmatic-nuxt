<script setup lang="ts">
import { Button } from "~/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "~/components/ui/sheet";

const route = useRoute();
const open = ref(false);

const items = computed(() => [
  { label: "Docs", to: "/docs/getting-started", active: route.path.startsWith("/docs") },
  { label: "Pricing", to: "/pricing", active: route.path.startsWith("/pricing") },
  { label: "Blog", to: "/blog", active: route.path.startsWith("/blog") },
  { label: "Changelog", to: "/changelog", active: route.path.startsWith("/changelog") },
]);
</script>

<template>
  <header class="border-grid bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
    <div class="container flex h-16 items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <AppLogo class="h-6 w-auto shrink-0" />
        <TemplateMenu class="hidden sm:block" />
      </div>

      <nav
        class="hidden items-center gap-1 md:flex"
        aria-label="Main navigation"
      >
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
          :class="item.active ? 'text-foreground' : 'text-muted-foreground'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <ModeSwitcher />
        <Button
          as="a"
          href="/login"
          variant="outline"
          class="hidden lg:inline-flex"
        >
          Sign in
        </Button>
        <Button
          as="a"
          href="/signup"
          class="hidden lg:inline-flex"
        >
          Sign up
          <Icon
            name="i-lucide-arrow-right"
            class="size-4"
          />
        </Button>
        <Sheet v-model:open="open">
          <SheetTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="md:hidden"
              aria-label="Open menu"
            >
              <Icon
                name="i-lucide-menu"
                class="size-5"
              />
            </Button>
          </SheetTrigger>
          <SheetContent class="md:hidden">
            <nav
              class="mt-8 grid gap-1"
              aria-label="Mobile navigation"
            >
              <SheetClose
                v-for="item in items"
                :key="item.to"
                as-child
              >
                <NuxtLink
                  :to="item.to"
                  class="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  {{ item.label }}
                </NuxtLink>
              </SheetClose>
            </nav>
            <div class="mt-4 grid gap-2 border-t px-6 pt-4">
              <SheetClose as-child>
                <Button
                  as="a"
                  href="/login"
                  variant="outline"
                >
                  Sign in
                </Button>
              </SheetClose>
              <SheetClose as-child>
                <Button
                  as="a"
                  href="/signup"
                >
                  Sign up
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
