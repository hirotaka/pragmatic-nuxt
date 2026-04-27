import { useMutation } from "#layers/base/app/composables/useMutation";

interface UseDeleteCommentConfig {
  onSuccess?: () => void;
}

export const useDeleteComment = (config?: UseDeleteCommentConfig) => {
  return useMutation(
    async (commentId: string): Promise<undefined> => {
      await $fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      return undefined;
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};
