import { useMutation, useQueryCache } from "@pinia/colada";

interface UseDeleteDiscussionConfig {
  onSuccess?: () => void;
}

export const useDeleteDiscussion = (config?: UseDeleteDiscussionConfig) => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  const { mutate, isLoading, error } = useMutation<undefined, string>({
    mutation: async (id: string): Promise<undefined> => {
      await $api<{ success: boolean }>(`/api/discussions/${id}`, {
        method: "DELETE",
      });
      return undefined;
    },
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ["discussions"] });
      config?.onSuccess?.();
    },
  });

  return {
    mutate,
    isLoading,
    error,
  };
};
