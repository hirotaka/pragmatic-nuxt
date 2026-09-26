export const useCreateComment = () => {
  const { $api } = useNuxtApp();

  return async (input: CreateCommentInput) => {
    await $api("/api/comments", {
      method: "POST",
      body: input,
    });
  };
};
