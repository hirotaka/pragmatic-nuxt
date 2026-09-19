import type { Comment } from "~comments/shared/types";
import { useAPI } from "#layers/base/app/composables/useAPI";
import { usePaginatedData } from "#layers/base/app/composables/usePaginatedData";

export async function useComments(discussionId: MaybeRefOrGetter<string>) {
  const page = useState("comments-current-page", () => 1);
  const limit = 10;
  const resourceKey = computed(() => toValue(discussionId));
  const read = useAPI("/api/comments", {
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
