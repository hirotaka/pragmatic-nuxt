import { useNuxtApp } from "#app";
import {
  infiniteQueryOptions,
  mutationOptions,
  type QueryClient,
} from "@tanstack/vue-query";
import type { CreateCommentInput } from "~comments/shared/schemas";
import type { PaginatedComments } from "~comments/shared/types";
import {
  authenticatedMutationMeta,
  authenticatedQueryMeta,
} from "#layers/base/app/queries/queryPolicy";

const COMMENT_PAGE_LIMIT = 10;

export const COMMENT_QUERY_KEYS = {
  all: ["comments"] as const,
  discussion: (discussionId: string) => [
    ...COMMENT_QUERY_KEYS.all,
    "discussion",
    discussionId,
  ] as const,
};

export function commentsInfiniteQuery({
  discussionId,
  enabled = true,
}: {
  discussionId: string;
  enabled?: boolean;
}) {
  const { $api } = useNuxtApp();

  return infiniteQueryOptions({
    queryKey: COMMENT_QUERY_KEYS.discussion(discussionId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }): Promise<PaginatedComments> => $api<PaginatedComments>("/api/comments", {
      signal,
      query: { discussionId, page: pageParam, limit: COMMENT_PAGE_LIMIT },
    }),
    enabled,
    meta: authenticatedQueryMeta(),
    getNextPageParam: lastPage => lastPage.meta.hasMore
      ? lastPage.meta.page + 1
      : undefined,
  });
}

export function createCommentMutation() {
  const { $api } = useNuxtApp();

  return mutationOptions({
    mutationKey: ["comment-mutation", "create"] as const,
    meta: authenticatedMutationMeta(),
    mutationFn: async (input: CreateCommentInput): Promise<void> => {
      await $api("/api/comments", {
        method: "POST",
        body: input,
      });
    },
  });
}

export function deleteCommentMutation() {
  const { $api } = useNuxtApp();

  return mutationOptions({
    mutationKey: ["comment-mutation", "delete"] as const,
    meta: authenticatedMutationMeta(),
    mutationFn: async ({ commentId }: { commentId: string; discussionId: string }): Promise<void> => {
      await $api(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
    },
  });
}

export function invalidateComments(queryClient: QueryClient, discussionId: string): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: COMMENT_QUERY_KEYS.discussion(discussionId),
  });
}
