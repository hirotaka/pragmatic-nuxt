import { createCommentRepository } from "~comments/server/repository/commentRepository";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const sessionUser = session.user as SessionUser;

  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Comment ID is required",
    });
  }

  const commentRepository = await createCommentRepository(event);

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
      statusMessage: "Forbidden - Only the author or admin can delete this comment",
    });
  }

  await commentRepository.delete(id);

  return { success: true };
});
