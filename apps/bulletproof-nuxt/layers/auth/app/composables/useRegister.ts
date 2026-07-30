import type { RegisterInput } from "~auth/shared/schemas";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

export const useRegister = () => {
  const { $api } = useNuxtApp();
  const { fetch: refreshSession } = useUserSession();
  const { addNotification } = useNotifications();

  return async (input: RegisterInput): Promise<void> => {
    await $api("/api/auth/register", {
      method: "POST",
      body: input,
    });

    await refreshSession();

    addNotification({
      type: "success",
      title: "Account Created",
    });
  };
};
