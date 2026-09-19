import { nextTick } from "vue";
import type { Comment } from "~comments/shared/types";
import { useAPI } from "#layers/base/app/composables/useAPI";
import { usePaginatedData } from "#layers/base/app/composables/usePaginatedData";

function useCommentsResource(discussionId: MaybeRefOrGetter<string>) {
  const pages = useState<Record<string, number>>("comments-current-pages", () => ({}));
  const resourceKey = computed(() => toValue(discussionId));
  const page = computed({
    get: () => pages.value[resourceKey.value] ?? 1,
    set: (value: number) => {
      pages.value = {
        ...pages.value,
        [resourceKey.value]: value,
      };
    },
  });
  const asyncDataKey = computed(() => `comments:${resourceKey.value}:${page.value}`);

  return { asyncDataKey, page, resourceKey };
}

export function useCommentsSettlement(discussionId: MaybeRefOrGetter<string>) {
  const { asyncDataKey, page } = useCommentsResource(discussionId);

  const refreshAfterCreate = async () => {
    page.value = 1;
    await nextTick();
    await refreshNuxtData(asyncDataKey.value).catch(() => undefined);
  };

  return { refreshAfterCreate };
}

export async function useComments(discussionId: MaybeRefOrGetter<string>) {
  const limit = 10;
  const { asyncDataKey, page, resourceKey } = useCommentsResource(discussionId);
  const read = useAPI("/api/comments", {
    key: asyncDataKey,
    query: {
      discussionId: resourceKey,
      page,
      limit,
    },
    watch: false,
  });
  const pagination = usePaginatedData<Comment>(read, {
    strategy: "append",
    page,
    resourceKey,
  });

  await read;

  const comments = computed(() => pagination.data.value);

  const refreshAfterCreate = async () => {
    await pagination.loadPage(1).catch(() => undefined);
  };

  const refreshAfterDelete = async () => {
    await pagination.loadPage(1).catch(() => undefined);
  };

  return {
    comments,
    isLoading: pagination.isLoading,
    refreshAfterCreate,
    refreshAfterDelete,
    loadMore: pagination.loadMore,
  };
}
