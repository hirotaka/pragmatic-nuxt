import { createCommentRepository } from "#layers/discussions/server/repository/commentRepository";

export default defineAuthenticatedEventHandler(async (event, sessionUser) => {
  const discussionId = await requireDiscussionForComments(event, sessionUser);
  const commentId = getRouterParam(event, "commentId");
  if (!commentId) {
    throw createError({ statusCode: 400, statusMessage: "Comment ID is required" });
  }

  const commentRepository = createCommentRepository();
  const existingComment = await commentRepository.findById(commentId);
  if (!existingComment || existingComment.discussionId !== discussionId) {
    throw createError({ statusCode: 404, statusMessage: "Comment not found" });
  }

  assertCommentDelete(sessionUser, existingComment);
  const deleted = await commentRepository.delete(commentId, discussionId);
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Comment not found" });
  }
  setResponseStatus(event, 204);
});
