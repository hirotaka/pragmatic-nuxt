import { defineMutationOptions } from "@pinia/colada";
import type { UpdateProfileInput } from "~users/shared/schemas";

export const updateProfileMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const { fetch: refreshSession } = useUserSession();

  return {
    mutation: async (input: UpdateProfileInput): Promise<void> => {
      await $api("/api/profile", {
        method: "PATCH",
        body: input,
      });
      await refreshSession();
    },
  };
});
