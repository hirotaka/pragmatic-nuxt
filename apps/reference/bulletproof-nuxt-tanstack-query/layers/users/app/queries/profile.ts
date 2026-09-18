import { useNuxtApp } from "#app";
import { mutationOptions } from "@tanstack/vue-query";
import type { UpdateProfileInput } from "~users/shared/schemas";
import { useRequiredUserSessionRefresh } from "#layers/auth/app/composables/useRequiredUserSessionRefresh";
import { authenticatedMutationMeta } from "#layers/base/app/queries/queryPolicy";

export function updateProfileMutation() {
  const { $api } = useNuxtApp();
  const refreshSession = useRequiredUserSessionRefresh();

  return mutationOptions({
    mutationKey: ["profile-mutation", "update"] as const,
    meta: authenticatedMutationMeta(),
    mutationFn: async (input: UpdateProfileInput): Promise<void> => {
      await $api("/api/profile", {
        method: "PATCH",
        body: input,
      });
      await refreshSession();
    },
  });
}
