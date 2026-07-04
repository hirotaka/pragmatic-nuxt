<script setup lang="ts">
import ButtonPrimitive from "~~/components/ui/button/Button.vue";
</script>

<template>
  <ButtonPrimitive v-bind="$attrs">
    <template
      v-for="(_, name) in $slots"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps"
      />
    </template>
  </ButtonPrimitive>
</template>
