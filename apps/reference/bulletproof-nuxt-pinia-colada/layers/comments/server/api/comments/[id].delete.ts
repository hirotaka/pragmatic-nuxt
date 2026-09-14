import { createCommentRepository } from "~comments/server/repository/commentRepository";
import { defineProtectedEventHandler } from "#layers/auth/server/utils/defineProtectedEventHandler";

export default defineProtectedEventHandler(async (event, sessionUser) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Comment ID is required",
    });
  }

  const commentRepository = createCommentRepository();

  const existingComment = await commentRepository.findById(id);

  if (!existingComment) {
    throw createError({
      statusCode: 404,
      statusMessage: "Comment not found",
    });
  }

  const isAuthor = existingComment.authorId === sessionUser.id;
  const isAdmin = sessionUser.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Comment delete not allowed",
    });
  }

  await commentRepository.delete(id);

  setResponseStatus(event, 204);
});
