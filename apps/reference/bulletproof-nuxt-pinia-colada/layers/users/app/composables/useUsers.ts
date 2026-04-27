import type { User } from "#layers/auth/shared/types";
import type { UsersResponse } from "~users/shared/types";
import { useQuery } from "@pinia/colada";

export function useUsers() {
  const { $api } = useNuxtApp();

  const { data: rawData, error, isPending } = useQuery({
    key: () => ["users"],
    query: () => $api<UsersResponse>("/api/users"),
  });

  const data = computed<User[]>(() => rawData.value?.data ?? []);

  return {
    data,
    isPending,
    error,
  };
}
