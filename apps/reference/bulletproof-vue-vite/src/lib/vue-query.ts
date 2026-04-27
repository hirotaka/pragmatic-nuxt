import {
  QueryClient,
  type QueryClientConfig,
  type UseMutationOptions,
} from '@tanstack/vue-query';

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Throw errors instead of storing them in state
      throwOnError: true,
      // Refetch on window focus (only in production)
      refetchOnWindowFocus: import.meta.env.PROD,
      // Retry failed requests (only in production)
      retry: import.meta.env.PROD ? 3 : false,
      // Time before data is considered stale (5 seconds)
      staleTime: 1000 * 5,
    },
    mutations: {
      // Only throw critical errors (500, 503) - let ErrorBoundary handle them
      // Other errors (400, 401, 409, etc.) are handled by components via mutation.error
      throwOnError: (error) => {
        const status = (error as Error & { response?: { status?: number } })?.response?.status
        return status === 500 || status === 503
      },
    },
  },
};

export const queryClient = new QueryClient(queryConfig);

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>;

export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
> & {
  onSuccess?: (...args: any[]) => void;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
