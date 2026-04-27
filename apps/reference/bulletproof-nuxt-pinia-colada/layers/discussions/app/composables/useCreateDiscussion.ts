import type { CreateDiscussionInput } from "~discussions/shared/schemas";
import type { Discussion } from "~discussions/shared/types";
import { useMutation, useQueryCache } from "@pinia/colada";

interface UseCreateDiscussionConfig {
  onSuccess?: (discussion: Discussion) => void;
}

export const useCreateDiscussion = (config?: UseCreateDiscussionConfig) => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  const { mutate, isLoading, error, status } = useMutation<Discussion, CreateDiscussionInput>({
    mutation: async (input: CreateDiscussionInput) => {
      const response = await $api<{ discussion: Discussion }>(
        "/api/discussions",
        {
          method: "POST",
          body: input,
        },
      );

      return response.discussion;
    },
    onSuccess: (discussion) => {
      queryCache.invalidateQueries({ key: ["discussions"] });
      config?.onSuccess?.(discussion);
    },
  });

  const isSuccess = computed(() => status.value === "success");

  return {
    mutate,
    isLoading,
    isSuccess,
    error,
  };
};
