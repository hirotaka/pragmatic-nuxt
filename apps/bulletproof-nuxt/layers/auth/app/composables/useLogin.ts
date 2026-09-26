import { toast } from "vue-sonner";

export const useLogin = () => {
  const { $api } = useNuxtApp();
  const refreshSession = useRequiredUserSessionRefresh();

  return async (input: LoginInput): Promise<void> => {
    await $api("/api/auth/login", {
      method: "POST",
      body: input,
    });

    await refreshSession();

    toast.success("Logged In");
  };
};
