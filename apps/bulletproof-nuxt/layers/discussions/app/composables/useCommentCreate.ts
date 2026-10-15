export const useCommentCreate = () => {
  const { $api } = useNuxtApp();

  return async (discussionId: string, input: CreateCommentInput) => {
    await $api(`/api/discussions/${discussionId}/comments`, {
      method: "POST",
      body: input,
    });
  };
};
