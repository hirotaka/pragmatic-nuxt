import { useMutation, useQueryClient } from "@tanstack/vue-query";

import { axios } from "@/utils/axios";
import { useNotificationStore } from "@/stores/notifications";
import type { MutationConfig } from "@/lib/vue-query";

import type { Discussion } from "@/types";

export type CreateDiscussionDTO = {
  data: {
    title: string;
    body: string;
  };
};

export const createDiscussion = ({
  data,
}: CreateDiscussionDTO): Promise<Discussion> => {
  return axios.post(`/discussions`, data);
};

type UseCreateDiscussionOptions = {
  config?: MutationConfig<typeof createDiscussion>;
};

export const useCreateDiscussion = ({
  config,
}: UseCreateDiscussionOptions = {}) => {
  const queryClient = useQueryClient();
  const store = useNotificationStore();

  return useMutation({
    onMutate: async (newDiscussion) => {
      await queryClient.cancelQueries(["discussions"]);

      const previousDiscussions = queryClient.getQueryData<Discussion[]>([
        "discussions",
      ]);

      queryClient.setQueryData(
        ["discussions"],
        [...(previousDiscussions || []), newDiscussion.data]
      );

      return { previousDiscussions };
    },
    onError: (_, __, context: any) => {
      if (context?.previousDiscussions) {
        queryClient.setQueryData("discussions", context.previousDiscussions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries("discussions");
      store.add({
        type: "success",
        title: "Discussion Created",
      });
    },
    ...config,
    mutationFn: createDiscussion,
  });
};
