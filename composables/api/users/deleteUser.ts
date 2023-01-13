import { useMutation, useQueryClient } from "@tanstack/vue-query";

import { axios } from "@/utils/axios";
import { useNotificationStore } from "@/stores/notifications";
import type { MutationConfig } from "@/lib/vue-query";

import type { User } from "@/types";

export type DeleteUserDTO = {
  userId: string;
};

export const deleteUser = ({ userId }: DeleteUserDTO) => {
  return axios.delete(`/users/${userId}`);
};

type UseDeleteUserOptions = {
  config?: MutationConfig<typeof deleteUser>;
};

export const useDeleteUser = ({ config }: UseDeleteUserOptions = {}) => {
  const queryClient = useQueryClient();
  const store = useNotificationStore();

  return useMutation({
    onMutate: async (deletedUser) => {
      await queryClient.cancelQueries(["users"]);

      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      queryClient.setQueryData(
        ["users"],
        previousUsers?.filter(
          (discussion) => discussion.id !== deletedUser.userId
        )
      );

      return { previousUsers };
    },
    onError: (_, __, context: any) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      store.add({
        type: "success",
        title: "User Deleted",
      });
    },
    ...config,
    mutationFn: deleteUser,
  });
};
