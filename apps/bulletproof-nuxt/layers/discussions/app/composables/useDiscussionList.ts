export function useDiscussionList() {
  return usePaginatedAPI("/api/discussions", {
    query: page => ({ page, limit: 10 }),
    isEmpty: page => Array.isArray(page.items) && page.items.length === 0,
  });
}
