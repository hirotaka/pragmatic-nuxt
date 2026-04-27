import { useMutation } from "#layers/base/app/composables/useMutation";

interface UseDeleteDiscussionConfig {
  onSuccess?: () => void;
}

export const useDeleteDiscussion = (config?: UseDeleteDiscussionConfig) => {
  return useMutation(
    async (id: string): Promise<undefined> => {
      await $fetch<{ success: boolean }>(`/api/discussions/${id}`, {
        method: "DELETE",
      });
      return undefined;
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};
