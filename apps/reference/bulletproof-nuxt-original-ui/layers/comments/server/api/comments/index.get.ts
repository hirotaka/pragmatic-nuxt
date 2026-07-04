import { createCommentRepository } from "~comments/server/repository/commentRepository";
import type { PaginatedComments } from "~comments/shared/types";

export default defineEventHandler(async (event): Promise<PaginatedComments> => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const query = getQuery(event);
  const discussionId = query.discussionId as string;
  const page = parseInt((query.page as string) || "1", 10);
  const limit = parseInt((query.limit as string) || "10", 10);

  if (!discussionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "discussionId is required",
    });
  }

  const commentRepository = await createCommentRepository(event);

  return commentRepository.findByDiscussionId({
    discussionId,
    page,
    limit,
  });
});
