import type { User } from "#layers/auth/shared/types";
import type { UpdateProfileInput } from "~users/shared/schemas";
import type { UserResponse } from "~users/shared/types";
import { useMutation } from "#layers/base/app/composables/useMutation";

interface UseUpdateProfileConfig {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
}

export const useUpdateProfile = (config?: UseUpdateProfileConfig) => {
  return useMutation<UpdateProfileInput, User>(
    async (input: UpdateProfileInput) => {
      const response = await $fetch<UserResponse>("/api/profile", {
        method: "PATCH",
        body: input,
      });

      return response.data;
    },
    {
      onSuccess: config?.onSuccess,
      onError: config?.onError,
    },
  );
};
