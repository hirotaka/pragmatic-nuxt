import type { UpdateDiscussionInput } from "~discussions/shared/schemas";

export interface UpdateDiscussionParams {
  id: string;
  data: UpdateDiscussionInput;
}

export const useUpdateDiscussion = () => {
  const { $api } = useNuxtApp();

  return async ({ id, data }: UpdateDiscussionParams) => {
    await $api(
      `/api/discussions/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
  };
};
