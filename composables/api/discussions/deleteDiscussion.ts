import { useMutation, useQueryClient } from "@tanstack/vue-query";

import { axios } from "@/utils/axios";
import { useNotificationStore } from "@/stores/notifications";
import type { MutationConfig } from "@/lib/vue-query";

import type { Discussion } from "@/types";

export const deleteDiscussion = ({
  discussionId,
}: {
  discussionId: string;
}) => {
  return axios.delete(`/discussions/${discussionId}`);
};

type UseDeleteDiscussionOptions = {
  config?: MutationConfig<typeof deleteDiscussion>;
};

export const useDeleteDiscussion = ({
  config,
}: UseDeleteDiscussionOptions = {}) => {
  const queryClient = useQueryClient();
  const store = useNotificationStore();

  return useMutation({
    onMutate: async (deletedDiscussion) => {
      await queryClient.cancelQueries(["discussions"]);

      const previousDiscussions = queryClient.getQueryData<Discussion[]>([
        "discussions",
      ]);

      queryClient.setQueryData(
        ["discussions"],
        previousDiscussions?.filter(
          (discussion) => discussion.id !== deletedDiscussion.discussionId
        )
      );

      return { previousDiscussions };
    },
    onError: (_, __, context: any) => {
      if (context?.previousDiscussions) {
        queryClient.setQueryData(["discussions"], context.previousDiscussions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
      store.add({
        type: "success",
        title: "Discussion Deleted",
      });
    },
    ...config,
    mutationFn: deleteDiscussion,
  });
};
