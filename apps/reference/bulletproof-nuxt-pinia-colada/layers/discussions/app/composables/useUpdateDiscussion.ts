import type { UpdateDiscussionInput } from "~discussions/shared/schemas";
import type { Discussion } from "~discussions/shared/types";
import { useMutation, useQueryCache } from "@pinia/colada";

interface UpdateDiscussionParams {
  id: string;
  data: UpdateDiscussionInput;
}

interface UseUpdateDiscussionConfig {
  onSuccess?: (discussion: Discussion) => void;
}

export const useUpdateDiscussion = (config?: UseUpdateDiscussionConfig) => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  const { mutate, isLoading, error, status } = useMutation<Discussion, UpdateDiscussionParams>({
    mutation: async ({ id, data }: UpdateDiscussionParams) => {
      const response = await $api<{ discussion: Discussion }>(
        `/api/discussions/${id}`,
        {
          method: "PATCH",
          body: data,
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
