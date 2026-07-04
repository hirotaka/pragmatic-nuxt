import type { Comment, PaginatedComments } from "~comments/shared/types";

export function useComments(discussionId: MaybeRefOrGetter<string>) {
  const { addNotification } = useNotifications();

  const comments = ref<Comment[]>([]);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const hasMore = ref(false);
  const isLoading = ref(false);

  const loadComments = async (page = 1) => {
    isLoading.value = true;
    try {
      const id = toValue(discussionId);
      const queryParams = new URLSearchParams();
      queryParams.set("discussionId", id);
      if (page) queryParams.set("page", page.toString());

      const response = await $fetch<PaginatedComments>(
        `/api/comments?${queryParams.toString()}`,
        { method: "GET" },
      );

      if (page === 1) {
        comments.value = response.data;
      }
      else {
        comments.value = [...comments.value, ...response.data];
      }
      currentPage.value = response.meta.page;
      totalPages.value = response.meta.totalPages;
      hasMore.value = response.meta.hasMore || false;
    }
    catch {
      addNotification({
        type: "error",
        title: "Failed to load comments",
      });
    }
    finally {
      isLoading.value = false;
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || isLoading.value) return;
    await loadComments(currentPage.value + 1);
  };

  return {
    comments,
    currentPage,
    totalPages,
    hasMore,
    isLoading,
    loadComments,
    loadMore,
  };
}
