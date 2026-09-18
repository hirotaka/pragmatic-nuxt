import { useNuxtApp } from "#app";
import {
  mutationOptions,
  queryOptions,
  type QueryClient,
} from "@tanstack/vue-query";
import type {
  CreateDiscussionInput,
  UpdateDiscussionInput,
} from "~discussions/shared/schemas";
import type { Discussion, PaginatedDiscussions } from "~discussions/shared/types";
import {
  authenticatedMutationMeta,
  authenticatedQueryMeta,
} from "#layers/base/app/queries/queryPolicy";

const DEFAULT_DISCUSSION_PAGE = 1;
const DEFAULT_DISCUSSION_LIMIT = 10;
const MAX_DISCUSSION_LIMIT = 100;

export const DISCUSSION_QUERY_KEYS = {
  all: ["discussions"] as const,
  lists: () => [...DISCUSSION_QUERY_KEYS.all, "list"] as const,
  list: (page: number, limit: number) => [
    ...DISCUSSION_QUERY_KEYS.lists(),
    { page, limit },
  ] as const,
  detail: (id: string) => [...DISCUSSION_QUERY_KEYS.all, "detail", id] as const,
};

export function normalizeDiscussionPage(value: unknown): number {
  return normalizePositiveInteger(value, DEFAULT_DISCUSSION_PAGE);
}

function normalizeDiscussionLimit(value: unknown): number {
  return normalizePositiveInteger(value, DEFAULT_DISCUSSION_LIMIT, MAX_DISCUSSION_LIMIT);
}

function normalizePositiveInteger(value: unknown, fallback: number, maximum = Number.MAX_SAFE_INTEGER) {
  const parsed = typeof value === "number"
    ? value
    : typeof value === "string" && /^[1-9][0-9]*$/.test(value)
      ? Number(value)
      : Number.NaN;

  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : fallback;
}

export function discussionListQuery({
  page,
  limit,
  enabled = true,
}: {
  page: unknown;
  limit: unknown;
  enabled?: boolean;
}) {
  const normalizedPage = normalizeDiscussionPage(page);
  const normalizedLimit = normalizeDiscussionLimit(limit);
  const { $api } = useNuxtApp();

  return queryOptions({
    queryKey: DISCUSSION_QUERY_KEYS.list(normalizedPage, normalizedLimit),
    queryFn: ({ signal }): Promise<PaginatedDiscussions> => $api<PaginatedDiscussions>("/api/discussions", {
      signal,
      query: { page: normalizedPage, limit: normalizedLimit },
    }),
    enabled,
    meta: authenticatedQueryMeta(),
    placeholderData: previousData => previousData,
  });
}

export function discussionDetailQuery({
  id,
  enabled = true,
}: {
  id: string;
  enabled?: boolean;
}) {
  const { $api } = useNuxtApp();

  return queryOptions({
    queryKey: DISCUSSION_QUERY_KEYS.detail(id),
    queryFn: ({ signal }): Promise<Discussion> => $api<Discussion>(`/api/discussions/${id}`, {
      signal,
    }),
    enabled,
    meta: authenticatedQueryMeta(),
    placeholderData: previousData => previousData,
  });
}

export function createDiscussionMutation() {
  const { $api } = useNuxtApp();

  return mutationOptions({
    mutationKey: ["discussion-mutation", "create"] as const,
    meta: authenticatedMutationMeta(),
    mutationFn: async (input: CreateDiscussionInput): Promise<void> => {
      await $api("/api/discussions", {
        method: "POST",
        body: input,
      });
    },
  });
}

export function updateDiscussionMutation() {
  const { $api } = useNuxtApp();

  return mutationOptions({
    mutationKey: ["discussion-mutation", "update"] as const,
    meta: authenticatedMutationMeta(),
    mutationFn: async ({ id, data }: { id: string; data: UpdateDiscussionInput }): Promise<void> => {
      await $api(`/api/discussions/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
  });
}

export function deleteDiscussionMutation() {
  const { $api } = useNuxtApp();

  return mutationOptions({
    mutationKey: ["discussion-mutation", "delete"] as const,
    meta: authenticatedMutationMeta(),
    mutationFn: async (id: string): Promise<void> => {
      await $api(`/api/discussions/${id}`, {
        method: "DELETE",
      });
    },
  });
}

export function invalidateDiscussionLists(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: DISCUSSION_QUERY_KEYS.lists() });
}

export async function invalidateUpdatedDiscussion(queryClient: QueryClient, id: string): Promise<void> {
  await Promise.all([
    invalidateDiscussionLists(queryClient),
    queryClient.invalidateQueries({ queryKey: DISCUSSION_QUERY_KEYS.detail(id) }),
  ]);
}
