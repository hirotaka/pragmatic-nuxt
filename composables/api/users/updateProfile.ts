import { useMutation } from "@tanstack/vue-query";

import { useAuth } from "@/composables/useAuth";
import { axios } from "@/utils/axios";

import type { MutationConfig } from "@/lib/vue-query";

import { useNotificationStore } from "@/stores/notifications";

export type UpdateProfileDTO = {
  data: {
    email: string;
    firstName: string;
    lastName: string;
    bio: string;
  };
};

export const updateProfile = ({ data }: UpdateProfileDTO) => {
  return axios.patch(`/users/profile`, data);
};

type UseUpdateProfileOptions = {
  config?: MutationConfig<typeof updateProfile>;
};

export const useUpdateProfile = ({ config }: UseUpdateProfileOptions = {}) => {
  const store = useNotificationStore();
  const { refetchUser } = useAuth();

  return useMutation({
    onSuccess: () => {
      store.add({
        type: "success",
        title: "User Updated",
      });
      refetchUser();
    },
    ...config,
    mutationFn: updateProfile,
  });
};
