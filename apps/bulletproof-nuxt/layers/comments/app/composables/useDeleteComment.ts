export const useDeleteComment = () => {
  const { $api } = useNuxtApp();

  return async (commentId: string): Promise<void> => {
    await $api(`/api/comments/${commentId}`, {
      method: "DELETE",
    });
  };
};
