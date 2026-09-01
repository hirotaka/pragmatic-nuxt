import { PiniaColadaQueryHooksPlugin } from "@pinia/colada";
import { PiniaColadaDelayQuery } from "@pinia/colada-plugin-delay";
import { PiniaColadaRetry } from "@pinia/colada-plugin-retry";
import type { PiniaColadaOptions, UseQueryEntry } from "@pinia/colada";
import { tryUseNuxtApp } from "#app";
import { reloadNuxtApp, useRoute } from "#imports";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { extractErrorStatusCode } from "#layers/base/app/utils/errors";
import { resolveErrorNotification } from "#layers/base/app/utils/errorNotifications";

declare module "@pinia/colada" {
  // The generic parameters must mirror Pinia Colada's declaration for module augmentation.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface UseQueryEntryExtensions<TData, TError, TDataInitial extends TData | undefined = undefined> {
    isPrefetch?: boolean;
  }
}

function handleColadaError(error: unknown): void {
  if (import.meta.server) {
    return;
  }

  const notification = resolveErrorNotification(error);

  if (!notification) {
    return;
  }

  const nuxtApp = tryUseNuxtApp();

  if (!nuxtApp) {
    return;
  }

  // Error hooks run outside component setup, so restore Nuxt context before using composables.
  nuxtApp.runWithContext(() => {
    const route = useRoute();
    const isProtectedRoute = route.path === "/app" || route.path.startsWith("/app/");
    const shouldReloadForUnauthorizedError = extractErrorStatusCode(error) === 401 && isProtectedRoute;

    if (shouldReloadForUnauthorizedError) {
      reloadNuxtApp({ path: route.fullPath });
      return;
    }

    useNotifications().addNotification(notification);
  });
}

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  return extractErrorStatusCode(error) !== 401 && failureCount < 2;
}

interface ColadaErrorEntry {
  active: boolean;
  ext: UseQueryEntry<unknown>["ext"];
}

export const shouldHandleColadaQueryError = (entry: ColadaErrorEntry): boolean => {
  return !(entry.ext.isPrefetch === true && !entry.active);
};

const clearPrefetchMarker = (entry: UseQueryEntry<unknown>): void => {
  delete entry.ext.isPrefetch;
};

export default {
  plugins: [
    ...(import.meta.client
      ? [
          PiniaColadaRetry({ retry: shouldRetryQuery }),
          PiniaColadaDelayQuery({ delay: 200 }),
        ]
      : []),
    PiniaColadaQueryHooksPlugin({
      onSuccess: (_data, entry) => {
        if (entry.ext.isPrefetch) {
          clearPrefetchMarker(entry);
        }
      },
      onError: (error, entry) => {
        if (!shouldHandleColadaQueryError(entry)) {
          return;
        }

        if (entry.ext.isPrefetch) {
          clearPrefetchMarker(entry);
        }

        if (entry.ext?.isRetrying?.value) {
          return;
        }

        handleColadaError(error);
      },
    }),
  ],
  mutationOptions: {
    onError: handleColadaError,
  },
} satisfies PiniaColadaOptions;
