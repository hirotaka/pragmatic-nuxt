export function useCommentList(discussionId: string) {
  return useInfiniteAPI(`/api/discussions/${discussionId}/comments`, {
    initialPageParam: 1,
    query: page => ({ page, limit: 10 }),
    getNextPageParam: ({ meta }) => meta.hasMore ? meta.page + 1 : null,
  });
}
