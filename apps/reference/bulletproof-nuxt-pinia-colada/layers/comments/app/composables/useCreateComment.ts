import type { CreateCommentInput } from "~comments/shared/schemas";
import type { Comment } from "~comments/shared/types";
import { useMutation, useQueryCache } from "@pinia/colada";

interface UseCreateCommentConfig {
  onSuccess?: (comment: Comment) => void;
}

export const useCreateComment = (config?: UseCreateCommentConfig) => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  const { mutate, isLoading, error, status } = useMutation<Comment, CreateCommentInput>({
    mutation: async (input: CreateCommentInput) => {
      const response = await $api<{ data: Comment }>("/api/comments", {
        method: "POST",
        body: input,
      });

      return response.data;
    },
    onSuccess: (comment) => {
      queryCache.invalidateQueries({ key: ["comments"] });
      config?.onSuccess?.(comment);
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
