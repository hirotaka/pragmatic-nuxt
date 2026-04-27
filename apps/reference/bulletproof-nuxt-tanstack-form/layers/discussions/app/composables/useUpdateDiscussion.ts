import type { UpdateDiscussionInput } from "~discussions/shared/schemas";
import type { Discussion } from "~discussions/shared/types";
import { useMutation } from "#layers/base/app/composables/useMutation";

interface UpdateDiscussionParams {
  id: string;
  data: UpdateDiscussionInput;
}

interface UseUpdateDiscussionConfig {
  onSuccess?: (discussion: Discussion) => void;
}

export const useUpdateDiscussion = (config?: UseUpdateDiscussionConfig) => {
  return useMutation<UpdateDiscussionParams, Discussion>(
    async ({ id, data }: UpdateDiscussionParams) => {
      const response = await $fetch<{ discussion: Discussion }>(
        `/api/discussions/${id}`,
        {
          method: "PATCH",
          body: data,
        },
      );

      return response.discussion;
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};
