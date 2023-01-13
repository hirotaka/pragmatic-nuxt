<script lang="ts">
export const variants = {
  primary: "bg-blue-600 text-white hover:bg-gray-50:text-blue-600",
  inverse: "bg-white text-blue-600 hover:bg-blue-600:text-white",
  danger: "bg-red-600 text-white hover:bg-red-50:text-red-600",
};

export const sizes = {
  sm: "py-2 px-4 text-sm",
  md: "py-2 px-6 text-md",
  lg: "py-3 px-8 text-lg",
};
</script>

<script setup lang="ts">
interface BaseButtonProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
}

withDefaults(defineProps<BaseButtonProps>(), {
  variant: "primary",
  size: "md",
  isLoading: false,
});
</script>

<template>
  <button
    class="flex justify-center items-center border border-gray-300 disabled:opacity-70 disabled:cursor-not-allowed rounded-md shadow-sm font-medium focus:outline-none"
    :class="[variants[variant], sizes[size]]"
  >
    <slot v-if="!isLoading" name="startIcon"></slot>
    <BaseSpinner v-if="isLoading" size="sm" text-current="text-current" />
    <span class="mx-2">
      <slot></slot>
    </span>
    <slot v-if="!isLoading" name="endIcon"></slot>
  </button>
</template>
