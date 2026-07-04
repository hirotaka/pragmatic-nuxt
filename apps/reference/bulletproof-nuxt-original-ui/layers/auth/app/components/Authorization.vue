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

defineSlots<{
  "default"(): unknown;
  "forbidden-fallback"?(): unknown;
}>();

const { checkAccess } = useAuthorization();

const canAccess = computed(() => {
  // If both allowedRoles and policyCheck are provided, both must pass (AND)
  // If only one is provided, that one must pass
  const roleAccess = props.allowedRoles !== undefined
    ? checkAccess({ allowedRoles: props.allowedRoles })
    : true;

  const policyAccess = props.policyCheck !== undefined
    ? props.policyCheck
    : true;

  return roleAccess && policyAccess;
});
</script>

<template>
  <template v-if="canAccess">
    <slot />
  </template>
  <template v-else>
    <slot name="forbidden-fallback" />
  </template>
</template>
