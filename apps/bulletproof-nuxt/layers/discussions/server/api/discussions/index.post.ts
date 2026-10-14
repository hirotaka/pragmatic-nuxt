import { createDiscussionRepository } from "#layers/discussions/server/repository/discussionRepository";

export default defineAuthenticatedEventHandler(async (event, sessionUser) => {
  assertDiscussionTeamMember(sessionUser);

  const body = await readBody(event);

  const validationResult = createDiscussionInputSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid discussion",
    });
  }

  const { title, body: discussionBody } = validationResult.data;

  const discussionRepository = createDiscussionRepository();

  await discussionRepository.create({
    title,
    body: discussionBody,
    authorId: sessionUser.id,
    teamId: sessionUser.teamId,
  });

  setResponseStatus(event, 201);
});
