import type { CreateDiscussionInput } from "~discussions/shared/schemas";
import type { Discussion } from "~discussions/shared/types";
import { useMutation } from "#layers/base/app/composables/useMutation";

interface UseCreateDiscussionConfig {
  onSuccess?: (discussion: Discussion) => void;
}

export const useCreateDiscussion = (config?: UseCreateDiscussionConfig) => {
  return useMutation<CreateDiscussionInput, Discussion>(
    async (input: CreateDiscussionInput) => {
      const response = await $fetch<{ discussion: Discussion }>(
        "/api/discussions",
        {
          method: "POST",
          body: input,
        },
      );

      return response.discussion;
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};
