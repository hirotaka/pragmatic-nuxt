import { createCommentRepository } from "../../repository/commentRepository";

export default defineProtectedEventHandler(async (event): Promise<PaginatedComments> => {
  const query = getQuery(event);
  const discussionId = query.discussionId as string;
  const { page, limit } = parsePagination(query);

  if (!discussionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Discussion ID is required",
    });
  }

  const commentRepository = createCommentRepository();

  const comments = await commentRepository.findByDiscussionId({
    discussionId,
    page,
    limit,
  });

  return {
    ...comments,
    data: comments.data.map(serializeComment),
  };
});
