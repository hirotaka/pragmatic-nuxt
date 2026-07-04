import type { LoginInput } from "~auth/shared/schemas";
import type { User } from "~auth/shared/types";
import { useMutation } from "#layers/base/app/composables/useMutation";

interface UseLoginConfig {
  onSuccess?: (user: User) => void;
}

export const useLogin = (config?: UseLoginConfig) => {
  const { fetch } = useUserSession();

  return useMutation<LoginInput, User>(
    async (input: LoginInput) => {
      const response = await $fetch<{ user: User }>("/api/auth/login", {
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
