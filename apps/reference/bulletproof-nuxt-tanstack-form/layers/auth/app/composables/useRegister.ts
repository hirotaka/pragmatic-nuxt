import type { RegisterInput } from "~auth/shared/schemas";
import type { User } from "~auth/shared/types";
import { useMutation } from "#layers/base/app/composables/useMutation";

interface UseRegisterConfig {
  onSuccess?: (user: User) => void;
}

export const useRegister = (config?: UseRegisterConfig) => {
  const { fetch } = useUserSession();

  return useMutation<RegisterInput, User>(
    async (input: RegisterInput) => {
      const response = await $fetch<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: input,
      });

      // Refresh the session from the server
      await fetch();

      return response.user;
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};
