import { createDiscussionRepository } from "~discussions/server/repository/discussionRepository";
import type { User } from "#layers/auth/shared/types";

export default defineEventHandler(async (event) => {
  const sessionUser = (await requireUserSession(event)).user as User;

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

  const discussionRepository = await createDiscussionRepository(event);

  const existingDiscussion = await discussionRepository.findByIdAndTeam(id, sessionUser.teamId);

  if (!existingDiscussion) {
    throw createError({
      statusCode: 404,
      statusMessage: "Discussion not found",
    });
  }

  if (existingDiscussion.authorId !== sessionUser.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "Discussion delete not allowed",
    });
  }

  await discussionRepository.delete(id);

  setResponseStatus(event, 204);
});
