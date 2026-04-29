<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { HTMLAttributes, Component } from "vue";
import type { PrimitiveProps } from "reka-ui";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "~base/app/lib/utils";
import Spinner from "./Spinner.vue";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
  icon?: Component;
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  variant: "default",
  size: "default",
  type: "button",
  disabled: false,
  isLoading: false,
  class: undefined,
  icon: undefined,
});

const isDisabled = props.disabled || props.isLoading;
const spinnerSize = "sm" as const;
</script>

<template>
  <button
    :class="cn(buttonVariants({ variant, size }), props.class)"
    :type="type"
    :disabled="isDisabled"
  >
    <Spinner
      v-if="isLoading"
      :size="spinnerSize"
      class="text-current"
    />
    <span
      v-if="!isLoading && (icon || $slots.icon)"
      class="mr-2"
    >
      <component
        :is="icon"
        v-if="icon"
      />
      <slot
        v-else
        name="icon"
      />
    </span>
    <span class="mx-2">
      <slot />
    </span>
  </button>
</template>
