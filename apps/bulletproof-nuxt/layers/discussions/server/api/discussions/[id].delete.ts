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

  const existingDiscussion = await discussionRepository.findByIdAndTeamId(id, sessionUser.teamId);

  if (!existingDiscussion) {
    throw createError({
      statusCode: 404,
      statusMessage: "Discussion not found",
    });
  }

  assertDiscussionAuthor(sessionUser, existingDiscussion, "delete");

  const deleted = await discussionRepository.delete(id, sessionUser.teamId);
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Discussion not found" });
  }

  setResponseStatus(event, 204);
});
