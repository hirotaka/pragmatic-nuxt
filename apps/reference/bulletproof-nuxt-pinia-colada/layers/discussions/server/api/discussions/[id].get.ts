import { createDiscussionRepository } from "~discussions/server/repository/discussionRepository";
import { serializeDiscussion } from "~discussions/server/utils/serializeDiscussion";
import { requireCurrentUser } from "#layers/auth/server/utils/requireCurrentUser";

export default defineEventHandler(async (event) => {
  const sessionUser = await requireCurrentUser(event);

  if (!sessionUser.teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Team membership required",
    });
  }

  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Discussion ID is required",
    });
  }

  const discussionRepository = createDiscussionRepository();

  const discussion = await discussionRepository.findByIdAndTeam(id, sessionUser.teamId);

  if (!discussion) {
    throw createError({
      statusCode: 404,
      statusMessage: "Discussion not found",
    });
  }

  return serializeDiscussion(discussion);
});
