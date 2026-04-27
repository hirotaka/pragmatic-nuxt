import type { LoginInput } from "~auth/shared/schemas";
import type { User } from "~auth/shared/types";
import { useMutation } from "@pinia/colada";

interface UseLoginConfig {
  onSuccess?: (user: User) => void;
}

export const useLogin = (config?: UseLoginConfig) => {
  const { $api } = useNuxtApp();
  const { fetch } = useUserSession();

  const { mutate, isLoading, error } = useMutation<User, LoginInput>({
    mutation: async (input: LoginInput) => {
      const response = await $api<{ user: User }>("/api/auth/login", {
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
