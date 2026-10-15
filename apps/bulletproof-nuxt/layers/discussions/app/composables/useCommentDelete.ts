export const useCommentDelete = () => {
  const { $api } = useNuxtApp();

  return async (discussionId: string, commentId: string): Promise<void> => {
    await $api(`/api/discussions/${discussionId}/comments/${commentId}`, {
      method: "DELETE",
    });
  };
};
