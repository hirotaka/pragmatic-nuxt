<script lang="ts">
/* eslint-disable import/order */
import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonProps = {
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  asChild?: boolean
  isLoading?: boolean
  icon?: VNode
}
</script>

<script setup lang="ts">
import { Slot } from 'reka-ui'
import { computed } from 'vue'
import type { VNode } from 'vue'

import { Spinner } from '../spinner'

import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'default',
  asChild: false,
  isLoading: false,
})

const buttonClass = computed(() => {
  return cn(buttonVariants({ variant: props.variant, size: props.size }))
})
</script>

<template>
  <component :is="asChild ? Slot : 'button'" :class="buttonClass">
    <Spinner v-if="isLoading" size="sm" class="text-current" />
    <span v-if="!isLoading && (icon || $slots.icon)" class="mr-2">
      <component v-if="icon" :is="icon" />
      <slot v-else name="icon"></slot>
    </span>
    <span class="mx-2">
      <slot></slot>
    </span>
  </component>
</template>
