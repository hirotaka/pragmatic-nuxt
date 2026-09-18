import type { QueryClient } from "@tanstack/vue-query";
import { isTerminalAuthenticationError } from "#layers/base/app/queries/queryPolicy";
import { runServerStateSessionTransition } from "#layers/auth/app/composables/useServerStateSessionBoundary";

interface TerminalSessionObserverOptions {
  queryClient: QueryClient;
  refreshSession: () => Promise<void>;
  isLoggedIn: () => boolean;
  setTransitioning: (value: boolean) => void;
  onLoggedOut: () => Promise<void>;
}

export function observeTerminalSessionErrors({
  queryClient,
  refreshSession,
  isLoggedIn,
  setTransitioning,
  onLoggedOut,
}: TerminalSessionObserverOptions) {
  let refreshPromise: Promise<void> | undefined;

  const handleTerminalError = (error: unknown, authenticated: boolean) => {
    if (!authenticated || !isTerminalAuthenticationError(error) || refreshPromise) {
      return;
    }

    refreshPromise = runServerStateSessionTransition({
      operation: refreshSession,
      queryClient,
      removeQueriesAfterSuccess: () => !isLoggedIn(),
      setTransitioning,
    }).then(async () => {
      if (!isLoggedIn()) {
        await onLoggedOut();
      }
    }).finally(() => {
      refreshPromise = undefined;
    });

    void refreshPromise.catch(() => undefined);
  };

  const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      handleTerminalError(event.action.error, event.query.meta?.authenticated === true);
    }
  });
  const unsubscribeMutation = queryClient.getMutationCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      handleTerminalError(event.action.error, event.mutation.meta?.authenticated === true);
    }
  });

  return () => {
    unsubscribeQuery();
    unsubscribeMutation();
  };
}

export default defineNuxtPlugin({
  name: "vue-query-session",
  dependsOn: ["nuxt-query:plugin"],
  setup(nuxtApp) {
    const { fetch, loggedIn } = useUserSession();
    const isTransitioning = useState("tanstack-query-session-transition", () => false);

    observeTerminalSessionErrors({
      queryClient: nuxtApp.$queryClient as QueryClient,
      refreshSession: fetch,
      isLoggedIn: () => loggedIn.value,
      setTransitioning: (value) => {
        isTransitioning.value = value;
      },
      onLoggedOut: async () => {
        await nuxtApp.runWithContext(() => navigateTo("/auth/login"));
      },
    });
  },
});
