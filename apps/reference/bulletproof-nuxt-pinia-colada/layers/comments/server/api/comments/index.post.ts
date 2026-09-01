import { createCommentInputSchema } from "~comments/shared/schemas";
import { createCommentRepository } from "~comments/server/repository/commentRepository";
import { requireCurrentUser } from "#layers/auth/server/utils/requireCurrentUser";

export default defineEventHandler(async (event) => {
  const sessionUser = await requireCurrentUser(event);

  const body = await readBody(event);

  const validationResult = createCommentInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid comment",
    });
  }

  const { body: commentBody, discussionId } = validationResult.data;

  const commentRepository = createCommentRepository();

  await commentRepository.create({
    body: commentBody,
    discussionId,
    authorId: sessionUser.id,
  });

  setResponseStatus(event, 201);
});
