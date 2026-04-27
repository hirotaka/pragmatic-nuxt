<script setup lang="ts">
const router = useRouter();

defineProps<{
  error: {
    statusCode: number;
    message: string;
  };
}>();
</script>

<template>
  <Head
    title="Page Not Found"
    description="The page you're looking for doesn't exist"
  />
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-900">
        {{ error.statusCode }}
      </h1>
      <h2 class="mt-4 text-3xl font-semibold text-gray-700">
        Page Not Found
      </h2>
      <p class="mt-2 text-lg text-gray-600">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div class="mt-8 flex justify-center gap-4">
        <UButton @click="router.push('/')">
          Go to Home
        </UButton>
        <UButton
          variant="outline"
          @click="router.back()"
        >
          Go Back
        </UButton>
      </div>
    </div>
  </div>
</template>
