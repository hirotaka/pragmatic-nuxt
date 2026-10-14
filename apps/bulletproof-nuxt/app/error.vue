<script setup lang="ts">
const router = useRouter();
const goHome = () => clearError({ redirect: "/" });

const props = defineProps<{
  error: {
    statusCode: number;
    message: string;
  };
}>();

const isNotFound = computed(() => props.error.statusCode === 404);
const isServerError = computed(() => props.error.statusCode >= 500);
const title = computed(() => isNotFound.value ? "Page Not Found" : "Something Went Wrong");
const safeErrorDescription = "Something went wrong. Please try again.";
const description = computed(() => isNotFound.value
  ? "Sorry, we couldn't find the page you're looking for."
  : isServerError.value ? safeErrorDescription : props.error.message);

useSeoMeta({
  title: () => title.value,
  description: () => isNotFound.value ? description.value : safeErrorDescription,
});
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
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
        <Button @click="goHome">
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
  </main>
</template>
