import type { LoginInput } from "~auth/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

export const useLogin = () => {
  const { $api } = useNuxtApp();
  const { fetch: refreshSession } = useUserSession();
  const { addNotification } = useNotifications();

  return async (input: LoginInput): Promise<void> => {
    await $api("/api/auth/login", {
      method: "POST",
      body: input,
    });

    await refreshSession();

    addNotification({
      type: "success",
      title: "Logged In",
    });
  };
};
