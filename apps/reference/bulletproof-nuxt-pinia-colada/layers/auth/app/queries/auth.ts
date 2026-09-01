import { defineMutationOptions } from "@pinia/colada";
import type { LoginInput, RegisterInput } from "~auth/shared/schemas";

export const loginMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const { fetch: refreshSession } = useUserSession();

  return {
    mutation: async (input: LoginInput): Promise<void> => {
      await $api("/api/auth/login", { method: "POST", body: input });
      await refreshSession();
    },
  };
});

export const registerMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const { fetch: refreshSession } = useUserSession();

  return {
    mutation: async (input: RegisterInput): Promise<void> => {
      await $api("/api/auth/register", { method: "POST", body: input });
      await refreshSession();
    },
  };
});
