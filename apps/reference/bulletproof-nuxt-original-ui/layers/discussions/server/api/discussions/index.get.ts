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

  const query = getQuery(event);
  const page = parseInt((query.page as string) || "1", 10);
  const limit = parseInt((query.limit as string) || "10", 10);

  if (page < 1 || limit < 1 || limit > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid pagination parameters",
    });
  }

  const discussionRepository = await createDiscussionRepository(event);

  return discussionRepository.findAll({
    teamId: sessionUser.teamId,
    page,
    limit,
  });
});
