import { defineInfiniteQueryOptions, defineMutationOptions, useQueryCache } from "@pinia/colada";
import type { CreateCommentInput } from "~comments/shared/schemas";
import type { PaginatedComments } from "~comments/shared/types";

export const COMMENT_QUERY_KEYS = {
  all: ["comments"] as const,
  discussion: (discussionId: string) => [
    ...COMMENT_QUERY_KEYS.all,
    discussionId,
  ] as const,
};

export const commentsQuery = defineInfiniteQueryOptions(
  ({ discussionId }: { discussionId: string }) => {
    return {
      key: COMMENT_QUERY_KEYS.discussion(discussionId),
      delay: 0,
      initialPageParam: 1,
      query: async ({ pageParam, signal }): Promise<PaginatedComments> => {
        const { $api } = useNuxtApp();

        return await $api<PaginatedComments>("/api/comments", {
          signal,
          query: { discussionId, page: pageParam, limit: 10 },
        });
      },
      getNextPageParam: lastPage => lastPage.meta.hasMore
        ? lastPage.meta.page + 1
        : undefined,
    };
  },
);

const invalidateComments = (queryCache: ReturnType<typeof useQueryCache>, discussionId: string) => {
  void queryCache.invalidateQueries({ key: COMMENT_QUERY_KEYS.discussion(discussionId) }).catch(() => undefined);
};

export const createCommentMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  return {
    mutation: async (input: CreateCommentInput): Promise<void> => {
      await $api("/api/comments", { method: "POST", body: input });
    },
    onSuccess: (_data, input) => invalidateComments(queryCache, input.discussionId),
  };
});

export const deleteCommentMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  return {
    mutation: async ({ commentId }: { commentId: string; discussionId: string }): Promise<void> => {
      await $api(`/api/comments/${commentId}`, { method: "DELETE" });
    },
    onSuccess: (_data, { discussionId }) => invalidateComments(queryCache, discussionId),
  };
});
