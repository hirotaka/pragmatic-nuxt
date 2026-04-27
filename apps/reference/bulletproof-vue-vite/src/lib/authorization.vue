<script setup lang="ts">
import { computed } from 'vue'

import { useAuthorization, type Role, type Policy } from '@/lib/authorization'
import type { User, Comment, Discussion } from '@/types/api'

type AuthorizationProps = {
  policyCheck?: keyof Policy
  allowedRoles?: Role | Role[]
  data?: User | Comment | Discussion
}

const props = defineProps<AuthorizationProps>()

const { checkAccess, hasRole } = useAuthorization()

const canAccess = computed(() => {
  // If both policyCheck and allowedRoles are provided, both must pass
  if (props.policyCheck && props.allowedRoles) {
    return checkAccess(props.policyCheck, props.data as never) && hasRole(props.allowedRoles)
  }

  // If only policyCheck is provided
  if (props.policyCheck) {
    return checkAccess(props.policyCheck, props.data as never)
  }

  // If only allowedRoles is provided
  if (props.allowedRoles) {
    return hasRole(props.allowedRoles)
  }

  // If neither is provided, deny access by default
  return false
})
</script>

<template>
  <template v-if="canAccess">
    <slot />
  </template>
  <template v-else>
    <slot name="forbiddenFallback" />
  </template>
</template>
