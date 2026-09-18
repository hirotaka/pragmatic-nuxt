import { useNuxtApp } from "#app";
import {
  mutationOptions,
  queryOptions,
  type QueryClient,
} from "@tanstack/vue-query";
import type { PaginatedUsers } from "~users/shared/types";
import {
  authenticatedMutationMeta,
  authenticatedQueryMeta,
} from "#layers/base/app/queries/queryPolicy";

const DEFAULT_USER_PAGE = 1;
const DEFAULT_USER_LIMIT = 10;
const MAX_USER_LIMIT = 100;

export const USER_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_QUERY_KEYS.all, "list"] as const,
  list: (page: number, limit: number) => [
    ...USER_QUERY_KEYS.lists(),
    { page, limit },
  ] as const,
};

export function normalizeUserPage(value: unknown): number {
  return normalizePositiveInteger(value, DEFAULT_USER_PAGE);
}

function normalizeUserLimit(value: unknown): number {
  return normalizePositiveInteger(value, DEFAULT_USER_LIMIT, MAX_USER_LIMIT);
}

function normalizePositiveInteger(value: unknown, fallback: number, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed = typeof value === "number"
    ? value
    : typeof value === "string" && /^[1-9][0-9]*$/.test(value)
      ? Number(value)
      : Number.NaN;

  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : fallback;
}

export function userListQuery({
  page,
  limit,
  enabled = true,
}: {
  page: unknown;
  limit: unknown;
  enabled?: boolean;
}) {
  const normalizedPage = normalizeUserPage(page);
  const normalizedLimit = normalizeUserLimit(limit);
  const { $api } = useNuxtApp();

  return queryOptions({
    queryKey: USER_QUERY_KEYS.list(normalizedPage, normalizedLimit),
    queryFn: ({ signal }): Promise<PaginatedUsers> => $api<PaginatedUsers>("/api/users", {
      signal,
      query: { page: normalizedPage, limit: normalizedLimit },
    }),
    enabled,
    meta: authenticatedQueryMeta(),
    placeholderData: previousData => previousData,
  });
}

export function deleteUserMutation() {
  const { $api } = useNuxtApp();

  return mutationOptions({
    mutationKey: ["user-mutation", "delete"] as const,
    meta: authenticatedMutationMeta(),
    mutationFn: async (userId: string): Promise<void> => {
      await $api(`/api/users/${userId}`, {
        method: "DELETE",
      });
    },
  });
}

export function invalidateUserLists(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
}
