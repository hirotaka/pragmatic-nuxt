import { createCommentRepository } from "~comments/server/repository/commentRepository";
import type { PaginatedComments } from "~comments/shared/types";
import { serializeComment } from "~comments/server/utils/serializeComment";
import { parsePagination } from "~base/server/utils/parsePagination";

export default defineEventHandler(async (event): Promise<PaginatedComments> => {
  await requireUserSession(event);

  const query = getQuery(event);
  const discussionId = query.discussionId as string;
  const { page, limit } = parsePagination(query);

  if (!discussionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Discussion ID is required",
    });
  }

  const commentRepository = await createCommentRepository(event);

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
