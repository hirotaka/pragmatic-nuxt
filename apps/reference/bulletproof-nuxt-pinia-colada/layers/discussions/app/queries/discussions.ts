import { defineMutationOptions, defineQueryOptions, useQueryCache } from "@pinia/colada";
import type { CreateDiscussionInput, UpdateDiscussionInput } from "~discussions/shared/schemas";
import type { Discussion, PaginatedDiscussions } from "~discussions/shared/types";

export const DISCUSSION_QUERY_KEYS = {
  all: ["discussions"] as const,
  list: (page: number, limit: number) => [
    ...DISCUSSION_QUERY_KEYS.all,
    { page, limit },
  ] as const,
  detail: (id: string) => [
    ...DISCUSSION_QUERY_KEYS.all,
    id,
  ] as const,
};

export const discussionListQuery = defineQueryOptions(
  ({ page, limit }: { page: number; limit: number }) => {
    return {
      key: DISCUSSION_QUERY_KEYS.list(page, limit),
      query: ({ signal }) => {
        const { $api } = useNuxtApp();

        return $api<PaginatedDiscussions>("/api/discussions", {
          signal,
          query: { page, limit },
        });
      },
      placeholderData: previousData => previousData,
    };
  },
);

export const discussionDetailQuery = defineQueryOptions(
  ({ id }: { id: string }) => {
    return {
      key: DISCUSSION_QUERY_KEYS.detail(id),
      query: async ({ signal }): Promise<Discussion> => {
        const { $api } = useNuxtApp();

        return await $api<Discussion>(`/api/discussions/${id}`, {
          signal,
        });
      },
    };
  },
);

const invalidateDiscussionLists = (queryCache: ReturnType<typeof useQueryCache>) => {
  void queryCache.invalidateQueries({ key: DISCUSSION_QUERY_KEYS.all }).catch(() => undefined);
};

export const createDiscussionMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  return {
    mutation: async (input: CreateDiscussionInput): Promise<void> => {
      await $api("/api/discussions", {
        method: "POST",
        body: input,
      });
    },
    onSuccess: () => invalidateDiscussionLists(queryCache),
  };
});

export const deleteDiscussionMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  return {
    mutation: async (id: string): Promise<void> => {
      await $api(`/api/discussions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => invalidateDiscussionLists(queryCache),
  };
});

export interface UpdateDiscussionParams {
  id: string;
  data: UpdateDiscussionInput;
}

const invalidateDiscussionDetailAndLists = (
  queryCache: ReturnType<typeof useQueryCache>,
) => {
  invalidateDiscussionLists(queryCache);
};

export const updateDiscussionMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  return {
    mutation: async ({ id, data }: UpdateDiscussionParams): Promise<void> => {
      await $api(`/api/discussions/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => invalidateDiscussionDetailAndLists(queryCache),
  };
});
