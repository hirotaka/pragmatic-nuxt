import { createDiscussionRepository } from "~discussions/server/repository/discussionRepository";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const sessionUser = session.user as SessionUser;

  if (!sessionUser.teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User must belong to a team",
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
      statusMessage: "Forbidden - Only the author can delete this discussion",
    });
  }

  await discussionRepository.delete(id);

  return { success: true };
});
