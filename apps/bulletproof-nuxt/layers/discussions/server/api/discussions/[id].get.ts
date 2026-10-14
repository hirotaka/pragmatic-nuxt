import { createDiscussionRepository } from "#layers/discussions/server/repository/discussionRepository";

export default defineAuthenticatedEventHandler(async (event, sessionUser) => {
  assertDiscussionTeamMember(sessionUser);

  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Discussion ID is required",
    });
  }

  const discussionRepository = createDiscussionRepository();

  const discussion = await discussionRepository.findByIdAndTeamId(id, sessionUser.teamId);

  if (!discussion) {
    throw createError({
      statusCode: 404,
      statusMessage: "Discussion not found",
    });
  }

  return serializeDiscussion(discussion);
});
