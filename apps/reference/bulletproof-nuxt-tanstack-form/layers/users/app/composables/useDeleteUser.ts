import type { DeleteUserResponse } from "~users/shared/types";
import { useMutation } from "#layers/base/app/composables/useMutation";

interface UseDeleteUserConfig {
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
}

export const useDeleteUser = (config?: UseDeleteUserConfig) => {
  return useMutation<string, string>(
    async (userId: string) => {
      const response = await $fetch<DeleteUserResponse>(
        `/api/users/${userId}`,
        {
          method: "DELETE",
        },
      );

      return response.message;
    },
    {
      onSuccess: config?.onSuccess,
      onError: config?.onError,
    },
  );
};
