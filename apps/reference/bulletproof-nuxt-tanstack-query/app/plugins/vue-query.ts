import type { NuxtApp } from "#app";
import {
  MutationCache,
  QueryClient,
} from "@tanstack/vue-query";
import { isTerminalAuthenticationError } from "#layers/base/app/queries/queryPolicy";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { resolveApiErrorNotification } from "#layers/base/app/utils/apiNotifications";
import { UserSessionRefreshError } from "#layers/auth/app/composables/useRequiredUserSessionRefresh";

export function createQueryClient(onMutationError?: (error: unknown) => void) {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: error => onMutationError?.(error),
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
      },
    },
  });
}

export function configureNuxtQuery(
  nuxtApp: NuxtApp,
  onMutationError?: (error: unknown) => void,
) {
  nuxtApp.hook("nuxt-query:configure", (setQueryClient) => {
    setQueryClient(createQueryClient(onMutationError));
  });
}

export default defineNuxtPlugin({
  name: "vue-query-config",
  enforce: "pre",
  setup(nuxtApp) {
    const { addNotification } = useNotifications();

    configureNuxtQuery(nuxtApp, import.meta.client
      ? (error) => {
          if (error instanceof UserSessionRefreshError || isTerminalAuthenticationError(error)) return;
          const notification = resolveApiErrorNotification(error);
          if (notification) addNotification(notification);
        }
      : undefined);
  },
});
