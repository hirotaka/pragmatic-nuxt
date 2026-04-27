import type { DeleteUserResponse } from "~users/shared/types";
import { useMutation, useQueryCache } from "@pinia/colada";

interface UseDeleteUserConfig {
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
}

export const useDeleteUser = (config?: UseDeleteUserConfig) => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  const { mutate, isLoading, error } = useMutation<string, string>({
    mutation: async (userId: string) => {
      const response = await $api<DeleteUserResponse>(
        `/api/users/${userId}`,
        {
          method: "DELETE",
        },
      );

      return response.message;
    },
    onSuccess: (message) => {
      queryCache.invalidateQueries({ key: ["users"] });
      config?.onSuccess?.(message);
    },
    onError: (err) => {
      config?.onError?.(err instanceof Error ? err : new Error(String(err)));
    },
  });

  return {
    mutate,
    isLoading,
    error,
  };
};
