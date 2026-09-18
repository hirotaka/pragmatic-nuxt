import { useQueryClient, type QueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
import { isAuthenticatedQuery } from "#layers/base/app/queries/queryPolicy";

interface SessionTransitionOptions {
  operation: () => Promise<void>;
  queryClient: QueryClient;
  removeQueriesAfterSuccess?: () => boolean;
  setTransitioning: (value: boolean) => void;
}

export async function runServerStateSessionTransition({
  operation,
  queryClient,
  removeQueriesAfterSuccess = () => true,
  setTransitioning,
}: SessionTransitionOptions): Promise<void> {
  setTransitioning(true);

  try {
    await queryClient.cancelQueries({ predicate: isAuthenticatedQuery });
    await operation();

    if (removeQueriesAfterSuccess()) {
      queryClient.removeQueries({ predicate: isAuthenticatedQuery });
    }
  }
  finally {
    setTransitioning(false);
  }
}

export function useServerStateQueryState() {
  const { loggedIn } = useUserSession();
  const isTransitioning = useState("tanstack-query-session-transition", () => false);
  const isQueryEnabled = computed(() => loggedIn.value && !isTransitioning.value);

  return { isQueryEnabled, isTransitioning };
}

export function useServerStateSessionBoundary() {
  const queryClient = useQueryClient();
  const { isQueryEnabled, isTransitioning } = useServerStateQueryState();

  const runSessionTransition = async (operation: () => Promise<void>) => {
    if (isTransitioning.value) {
      throw new Error("A user session transition is already in progress.");
    }

    await runServerStateSessionTransition({
      operation,
      queryClient,
      setTransitioning: (value) => {
        isTransitioning.value = value;
      },
    });
  };

  return {
    isQueryEnabled,
    isTransitioning,
    runSessionTransition,
  };
}
