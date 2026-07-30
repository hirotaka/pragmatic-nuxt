export const useDeleteDiscussion = () => {
  const { $api } = useNuxtApp();

  return async (id: string): Promise<void> => {
    await $api(`/api/discussions/${id}`, {
      method: "DELETE",
    });
  };
};
