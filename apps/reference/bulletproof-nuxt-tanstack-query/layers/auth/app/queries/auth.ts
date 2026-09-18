import { mutationOptions } from "@tanstack/vue-query";
import type { LoginInput, RegisterInput } from "~auth/shared/schemas";

function sessionMutation<TInput>(
  mutationKey: readonly unknown[],
  path: "/api/auth/login" | "/api/auth/register",
) {
  const { $api } = useNuxtApp();
  const refreshSession = useRequiredUserSessionRefresh();
  const { runSessionTransition } = useServerStateSessionBoundary();

  return mutationOptions({
    mutationKey,
    mutationFn: (input: TInput): Promise<void> => runSessionTransition(async () => {
      await $api(path, {
        method: "POST",
        body: input as Record<string, unknown>,
      });
      await refreshSession();
    }),
  });
}

export const loginMutation = () => sessionMutation<LoginInput>(
  ["auth-mutation", "login"] as const,
  "/api/auth/login",
);

export const registerMutation = () => sessionMutation<RegisterInput>(
  ["auth-mutation", "register"] as const,
  "/api/auth/register",
);
