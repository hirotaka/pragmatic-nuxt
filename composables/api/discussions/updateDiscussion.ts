import { useMutation, useQueryClient } from "@tanstack/vue-query";

import { axios } from "@/utils/axios";
import { useNotificationStore } from "@/stores/notifications";
import type { MutationConfig } from "@/lib/vue-query";

import type { Discussion } from "@/types";

export type UpdateDiscussionDTO = {
  data: {
    title: string;
    body: string;
  };
  discussionId: string;
};

export const updateDiscussion = ({
  data,
  discussionId,
}: UpdateDiscussionDTO): Promise<Discussion> => {
  return axios.patch(`/discussions/${discussionId}`, data);
};

type UseUpdateDiscussionOptions = {
  config?: MutationConfig<typeof updateDiscussion>;
};

export const useUpdateDiscussion = ({
  config,
}: UseUpdateDiscussionOptions = {}) => {
  const queryClient = useQueryClient();
  const store = useNotificationStore();

  return useMutation({
    onMutate: async (updatingDiscussion: any) => {
      await queryClient.cancelQueries([
        "discussion",
        updatingDiscussion?.discussionId,
      ]);

      const previousDiscussion = queryClient.getQueryData<Discussion>([
        "discussion",
        updatingDiscussion?.discussionId,
      ]);

      queryClient.setQueryData(
        ["discussion", updatingDiscussion?.discussionId],
        {
          ...previousDiscussion,
          ...updatingDiscussion.data,
          id: updatingDiscussion.discussionId,
        }
      );

      return { previousDiscussion };
    },
    onError: (_, __, context: any) => {
      if (context?.previousDiscussion) {
        queryClient.setQueryData(
          ["discussion", context.previousDiscussion.id],
          context.previousDiscussion
        );
      }
    },
    onSuccess: (data) => {
      queryClient.refetchQueries(["discussion", data.id]);
      store.add({
        type: "success",
        title: "Discussion Updated",
      });
    },
    ...config,
    mutationFn: updateDiscussion,
  });
};
