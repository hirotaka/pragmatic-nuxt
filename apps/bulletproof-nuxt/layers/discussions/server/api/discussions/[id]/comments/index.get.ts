import { createCommentRepository } from "#layers/discussions/server/repository/commentRepository";

export default defineAuthenticatedEventHandler(async (event, sessionUser): Promise<PaginatedComments> => {
  const discussionId = await requireDiscussionForComments(event, sessionUser);
  const { page, limit } = parsePagination(getQuery(event));
  const comments = await createCommentRepository().findAllByDiscussionId({ discussionId, page, limit });

  return {
    ...comments,
    items: comments.items.map(serializeComment),
  };
});
