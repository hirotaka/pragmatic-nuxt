import { useMutation, useQueryClient } from "@tanstack/vue-query";

import { axios } from "@/utils/axios";
import { useNotificationStore } from "@/stores/notifications";
import type { MutationConfig } from "@/lib/vue-query";

import type { Comment } from "@/types";

export const deleteComment = ({ commentId }: { commentId: string }) => {
  return axios.delete(`/comments/${commentId}`);
};

type UseDeleteCommentOptions = {
  discussionId: string;
  config?: MutationConfig<typeof deleteComment>;
};

export const useDeleteComment = ({
  config,
  discussionId,
}: UseDeleteCommentOptions) => {
  const queryClient = useQueryClient();
  const store = useNotificationStore();

  return useMutation({
    onMutate: async (deletedComment) => {
      await queryClient.cancelQueries(["comments", discussionId]);

      const previousComments = queryClient.getQueryData<Comment[]>([
        "comments",
        discussionId,
      ]);

      queryClient.setQueryData(
        ["comments", discussionId],
        previousComments?.filter(
          (comment) => comment.id !== deletedComment.commentId
        )
      );

      return { previousComments };
    },
    onError: (_, __, context: any) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", discussionId],
          context.previousComments
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", discussionId]);
      store.add({
        type: "success",
        title: "Comment Deleted",
      });
    },
    ...config,
    mutationFn: deleteComment,
  });
};
