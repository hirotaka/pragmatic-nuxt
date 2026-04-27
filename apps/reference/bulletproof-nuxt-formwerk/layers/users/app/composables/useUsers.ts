import type { UsersResponse } from "~users/shared/types";

export function useUsers() {
  const { data, status, error, refresh } = useFetch<UsersResponse>(
    "/api/users",
    {
      default: () => ({
        data: [],
      }),
      key: "users",
    },
  );

  const isPending = computed(() => status.value === "pending");
  const isSuccess = computed(() => status.value === "success");

  return {
    data: readonly(data),
    isPending,
    isSuccess,
    error: readonly(error),
    refresh,
  };
}
