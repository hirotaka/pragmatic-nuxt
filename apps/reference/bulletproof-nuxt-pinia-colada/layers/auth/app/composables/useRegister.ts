import type { RegisterInput } from "~auth/shared/schemas";
import type { User } from "~auth/shared/types";
import { useMutation } from "@pinia/colada";

interface UseRegisterConfig {
  onSuccess?: (user: User) => void;
}

export const useRegister = (config?: UseRegisterConfig) => {
  const { $api } = useNuxtApp();
  const { fetch } = useUserSession();

  const { mutate, isLoading, error } = useMutation<User, RegisterInput>({
    mutation: async (input: RegisterInput) => {
      const response = await $api<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: input,
      });

      return response.user;
    },
    onSuccess: async (user) => {
      await fetch();
      config?.onSuccess?.(user);
    },
  });

  return {
    mutate,
    isLoading,
    error,
  };
};
