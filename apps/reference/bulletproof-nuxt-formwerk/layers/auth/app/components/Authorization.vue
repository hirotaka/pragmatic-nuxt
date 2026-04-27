<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from "vue";
import type { RoleTypes } from "~auth/app/composables/useAuthorization";

type AuthorizationProps = {
  allowedRoles?: RoleTypes[];
  policyCheck?: boolean;
};

const props = withDefaults(defineProps<AuthorizationProps>(), {
  allowedRoles: undefined,
  policyCheck: undefined,
});

const { checkAccess } = useAuthorization();

const canAccess = computed(() => {
  let access = false;

  if (props.allowedRoles) {
    access = checkAccess({ allowedRoles: props.allowedRoles });
  }

  if (props.policyCheck !== undefined) {
    access = props.policyCheck;
  }

  return access;
});
</script>

<template>
  <template v-if="canAccess">
    <slot />
  </template>
  <template v-else>
    <slot name="forbiddenFallback" />
  </template>
</template>
