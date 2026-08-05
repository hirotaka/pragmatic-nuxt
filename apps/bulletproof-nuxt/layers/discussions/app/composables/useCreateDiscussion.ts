import type { CreateDiscussionInput } from "~discussions/shared/schemas";

export const useCreateDiscussion = () => {
  const { $api } = useNuxtApp();

  return async (input: CreateDiscussionInput) => {
    await $api(
      "/api/discussions",
      {
        method: "POST",
        body: input,
      },
    );
  };
};
