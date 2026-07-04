import { createCommentInputSchema } from "~comments/shared/schemas";
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

  const body = await readBody(event);

  const validationResult = createCommentInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation failed",
      data: validationResult.error.issues,
    });
  }

  const { body: commentBody, discussionId } = validationResult.data;

  const commentRepository = await createCommentRepository(event);

  const comment = await commentRepository.create({
    body: commentBody,
    discussionId,
    authorId: sessionUser.id,
  });

  setResponseStatus(event, 201);
  return { data: comment };
});
