import { createCommentRepository } from "#layers/discussions/server/repository/commentRepository";

export default defineAuthenticatedEventHandler(async (event, sessionUser) => {
  const discussionId = await requireDiscussionForComments(event, sessionUser);
  const validationResult = createCommentInputSchema.safeParse(await readBody(event));
  if (!validationResult.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid comment" });
  }

  await createCommentRepository().create({
    body: validationResult.data.body,
    discussionId,
    authorId: sessionUser.id,
  });

  setResponseStatus(event, 201);
});
