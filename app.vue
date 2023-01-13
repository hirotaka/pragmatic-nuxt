<template>
  <NuxtErrorBoundary>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <template #error>
      <AppError />
    </template>
  </NuxtErrorBoundary>
</template>
