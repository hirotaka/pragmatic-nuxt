export const useDiscussionUpdate = (id: MaybeRefOrGetter<string>) => {
  const { $api } = useNuxtApp();

  return async (input: UpdateDiscussionInput) => {
    await $api(
      `/api/discussions/${toValue(id)}`,
      {
        method: "PATCH",
        body: input,
      },
    );
  };
};
