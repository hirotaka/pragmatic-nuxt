import { defineMutationOptions } from "@pinia/colada";
import { useRequiredUserSessionRefresh } from "~auth/app/composables/useRequiredUserSessionRefresh";
import type { LoginInput, RegisterInput } from "~auth/shared/schemas";

export const loginMutation = defineMutationOptions(() => {
  const refreshRequiredSession = useRequiredUserSessionRefresh();

  return {
    mutation: async (input: LoginInput): Promise<void> => {
      const { $api } = useNuxtApp();
      await $api("/api/auth/login", { method: "POST", body: input });
      await refreshRequiredSession();
    },
  };
});

export const registerMutation = defineMutationOptions(() => {
  const refreshRequiredSession = useRequiredUserSessionRefresh();

  return {
    mutation: async (input: RegisterInput): Promise<void> => {
      const { $api } = useNuxtApp();
      await $api("/api/auth/register", { method: "POST", body: input });
      await refreshRequiredSession();
    },
  };
});
