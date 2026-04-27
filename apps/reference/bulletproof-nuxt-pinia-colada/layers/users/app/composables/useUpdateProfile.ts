import type { User } from "#layers/auth/shared/types";
import type { UpdateProfileInput } from "~users/shared/schemas";
import type { UserResponse } from "~users/shared/types";
import { useMutation, useQueryCache } from "@pinia/colada";

interface UseUpdateProfileConfig {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
}

export const useUpdateProfile = (config?: UseUpdateProfileConfig) => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  const { mutate, isLoading, error, status } = useMutation<User, UpdateProfileInput>({
    mutation: async (input: UpdateProfileInput) => {
      const response = await $api<UserResponse>("/api/profile", {
        method: "PATCH",
        body: input,
      });

      return response.data;
    },
    onSuccess: (user) => {
      queryCache.invalidateQueries({ key: ["users"] });
      config?.onSuccess?.(user);
    },
    onError: (err) => {
      config?.onError?.(err instanceof Error ? err : new Error(String(err)));
    },
  });

  const isSuccess = computed(() => status.value === "success");

  return {
    mutate,
    isLoading,
    isSuccess,
    error,
  };
};
