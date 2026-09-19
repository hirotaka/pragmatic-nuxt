<script setup lang="ts">
import { Button } from "@/components/ui/button";

const router = useRouter();

const props = defineProps<{
  error: {
    statusCode: number;
    message: string;
  };
}>();

const isNotFound = computed(() => props.error.statusCode === 404);
const title = computed(() => isNotFound.value ? "Page Not Found" : "Something Went Wrong");
const description = computed(() => isNotFound.value
  ? "Sorry, we couldn't find the page you're looking for."
  : props.error.message);
</script>

<template>
  <Head
    :title="title"
    :description="description"
  />
  <div class="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
    <div class="rounded-xl border bg-card p-8 text-center shadow-sm">
      <h1 class="text-8xl font-bold tracking-tight">
        {{ error.statusCode }}
      </h1>
      <h2 class="mt-4 text-3xl font-semibold tracking-tight">
        {{ title }}
      </h2>
      <p class="mt-2 text-lg text-muted-foreground">
        {{ description }}
      </p>
      <div class="mt-8 flex justify-center gap-4">
        <Button @click="router.push('/')">
          Go to Home
        </Button>
        <Button
          variant="outline"
          @click="router.back()"
        >
          Go Back
        </Button>
      </div>
    </div>
  </div>
</template>
