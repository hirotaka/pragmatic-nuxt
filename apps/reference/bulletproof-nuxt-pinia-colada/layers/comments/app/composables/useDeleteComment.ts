import { useMutation, useQueryCache } from "@pinia/colada";

interface UseDeleteCommentConfig {
  onSuccess?: () => void;
}

export const useDeleteComment = (config?: UseDeleteCommentConfig) => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  const { mutate, isLoading, error } = useMutation<undefined, string>({
    mutation: async (commentId: string): Promise<undefined> => {
      await $api(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      return undefined;
    },
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ["comments"] });
      config?.onSuccess?.();
    },
  });

  return {
    mutate,
    isLoading,
    error,
  };
};
