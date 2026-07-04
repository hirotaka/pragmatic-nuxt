import type { CreateCommentInput } from "~comments/shared/schemas";
import type { Comment } from "~comments/shared/types";
import { useMutation } from "#layers/base/app/composables/useMutation";

interface UseCreateCommentConfig {
  onSuccess?: (comment: Comment) => void;
}

export const useCreateComment = (config?: UseCreateCommentConfig) => {
  return useMutation<CreateCommentInput, Comment>(
    async (input: CreateCommentInput) => {
      const response = await $fetch<{ data: Comment }>("/api/comments", {
        method: "POST",
        body: input,
      });

      return response.data;
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};
