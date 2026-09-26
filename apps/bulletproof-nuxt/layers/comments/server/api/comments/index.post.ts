import { createCommentRepository } from "../../repository/commentRepository";

export default defineProtectedEventHandler(async (event, sessionUser) => {
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
