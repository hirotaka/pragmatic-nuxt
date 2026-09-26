import { toast } from "vue-sonner";

export const useRegister = () => {
  const { $api } = useNuxtApp();
  const refreshSession = useRequiredUserSessionRefresh();

  return async (input: RegisterInput): Promise<void> => {
    await $api("/api/auth/register", {
      method: "POST",
      body: input,
    });

    await refreshSession();

    toast.success("Account Created");
  };
};
