export const useDeleteUser = () => {
  const { $api } = useNuxtApp();

  return async (userId: string) => {
    await $api(
      `/api/users/${userId}`,
      {
        method: "DELETE",
      },
    );
  };
};
