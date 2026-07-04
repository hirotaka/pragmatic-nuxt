import { ref, readonly, type Ref } from "vue";
import { extractErrorMessage } from "~base/app/utils/errors";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

export interface UseMutationConfig<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: Error) => void;
  /** If true, no error notification will be shown (default: false) */
  disableErrorNotification?: boolean;
}

export interface UseMutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput>;
  isPending: Readonly<Ref<boolean>>;
  error: Readonly<Ref<Error | null>>;
  isSuccess: Readonly<Ref<boolean>>;
}

export interface UseMutationVoidResult<TOutput> {
  mutate: () => Promise<TOutput>;
  isPending: Readonly<Ref<boolean>>;
  error: Readonly<Ref<Error | null>>;
  isSuccess: Readonly<Ref<boolean>>;
}

/**
 * Generic mutation composable for handling async mutations with no input
 * @param mutationFn - Async function that performs the mutation
 * @param config - Configuration object with optional callbacks
 * @returns Object with mutate function and reactive state
 */
export function useMutation<TOutput>(
  mutationFn: () => Promise<TOutput>,
  config?: UseMutationConfig<TOutput>,
): UseMutationVoidResult<TOutput>;

/**
 * Generic mutation composable for handling async mutations
 * @param mutationFn - Async function that performs the mutation
 * @param config - Configuration object with optional callbacks
 * @returns Object with mutate function and reactive state
 */
export function useMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  config?: UseMutationConfig<TOutput>,
): UseMutationResult<TInput, TOutput>;

export function useMutation<TInput, TOutput>(
  mutationFn: ((input: TInput) => Promise<TOutput>) | (() => Promise<TOutput>),
  config?: UseMutationConfig<TOutput>,
):
  | UseMutationResult<TInput, TOutput>
  | UseMutationVoidResult<TOutput> {
  const isPending = ref(false);
  const error = ref<Error | null>(null);
  const isSuccess = ref(false);
  const { addNotification } = useNotifications();

  const mutate = async (input?: TInput): Promise<TOutput> => {
    isPending.value = true;
    error.value = null;
    isSuccess.value = false;

    try {
      let data: TOutput;
      if (input !== undefined) {
        data = await (
          mutationFn as (input: TInput) => Promise<TOutput>
        )(input);
      }
      else {
        data = await (mutationFn as () => Promise<TOutput>)();
      }
      isSuccess.value = true;
      config?.onSuccess?.(data);
      return data;
    }
    catch (err: unknown) {
      const message = extractErrorMessage(err, "Operation failed");
      error.value = new Error(message);

      if (!config?.disableErrorNotification) {
        addNotification({
          type: "error",
          title: "Error",
          message,
        });
      }

      config?.onError?.(error.value);
      throw error.value;
    }
    finally {
      isPending.value = false;
    }
  };

  return {
    mutate: mutate as
      | ((input: TInput) => Promise<TOutput>)
      | (() => Promise<TOutput>),
    isPending: readonly(isPending),
    error: readonly(error),
    isSuccess: readonly(isSuccess),
  } as UseMutationResult<TInput, TOutput> | UseMutationVoidResult<TOutput>;
}
