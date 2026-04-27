<script setup lang="ts">
import type { ButtonProps } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

type Props = {
  href: string
  isActive?: boolean
} & Pick<ButtonProps, 'size'>

const props = withDefaults(defineProps<Props>(), {
  size: 'icon',
})
</script>

<template>
  <Link
    :to="props.href"
    :aria-current="props.isActive ? 'page' : undefined"
    :class="[
      buttonVariants({
        variant: props.isActive ? 'outline' : 'ghost',
        size: props.size,
      }),
    ]"
  >
    <slot></slot>
  </Link>
</template>
