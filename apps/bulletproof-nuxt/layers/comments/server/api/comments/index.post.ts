import { createCommentInputSchema } from "~comments/shared/schemas";
import { createCommentRepository } from "~comments/server/repository/commentRepository";
import type { User } from "#layers/auth/shared/types";

export default defineEventHandler(async (event) => {
  const sessionUser = (await requireUserSession(event)).user as User;

  const body = await readBody(event);

  const validationResult = createCommentInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid comment",
    });
  }

  const { body: commentBody, discussionId } = validationResult.data;

  const commentRepository = await createCommentRepository(event);

  await commentRepository.create({
    body: commentBody,
    discussionId,
    authorId: sessionUser.id,
  });

  setResponseStatus(event, 201);
});
