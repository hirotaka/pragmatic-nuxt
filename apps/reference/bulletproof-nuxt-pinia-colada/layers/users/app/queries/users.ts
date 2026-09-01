import { defineMutationOptions, defineQueryOptions, useQueryCache } from "@pinia/colada";
import type { User } from "~users/shared/types";

export const USER_QUERY_KEYS = {
  all: ["users"] as const,
};

export const usersQuery = defineQueryOptions(() => {
  return {
    key: USER_QUERY_KEYS.all,
    query: ({ signal }) => {
      const { $api } = useNuxtApp();

      return $api<User[]>("/api/users", { signal });
    },
  };
});

export const deleteUserMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  return {
    mutation: async (userId: string): Promise<void> => {
      await $api(`/api/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void queryCache.invalidateQueries({ key: USER_QUERY_KEYS.all }).catch(() => undefined);
    },
  };
});
